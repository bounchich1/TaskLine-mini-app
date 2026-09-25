import { expect, test } from '@playwright/test';

import { chooseOption, openApp, openTicket, ticketCard } from './support/app';
import { MockApi } from './support/mock-api';

let api: MockApi;

test.beforeEach(async ({ page }) => {
    api = await MockApi.install(page);
    await openApp(page);
});

test('shows the conversation, attachment and assistant suggestion', async ({ page }) => {
    await openTicket(page, '000002');
    const card = ticketCard(page, '000002');

    await expect(card.getByText('Проверяем платёж, ответим в течение часа.')).toBeVisible();
    await expect(card.getByText('Бот поддержки')).toBeVisible();
    await expect(card.getByText('чек.pdf')).toBeVisible();
    await expect(card.getByText('20 КБ')).toBeVisible();
    await expect(card.getByText('Не доставлено')).toBeVisible();
    await expect(card.getByText(/Проверьте историю платежей/)).toBeVisible();
    await expect(card.getByText('Дата второго списания')).toBeVisible();
    await expect(card.getByText(/Источников: 2/)).toBeVisible();
});

test('keeps an unsent draft across collapsing the card', async ({ page }) => {
    await openTicket(page, '000002');
    const card = ticketCard(page, '000002');

    await card.getByRole('button', { name: 'Вставить в черновик' }).click();
    const reply = card.getByLabel('Текст ответа клиенту');

    await expect(reply).toHaveValue(/Проверьте историю платежей/);
    await card.getByRole('button', { name: 'Свернуть обращение' }).click();
    await page.getByRole('button', { name: 'Сохранить и свернуть' }).click();
    await expect(card).toHaveCount(0);
    await openTicket(page, '000002');

    await expect(ticketCard(page, '000002').getByLabel('Текст ответа клиенту')).toHaveValue(
        /Проверьте историю платежей/,
    );
});

test('sends a reply with the ticket version and an idempotency key', async ({ page }) => {
    await openTicket(page, '000002');
    const card = ticketCard(page, '000002');

    await card.getByLabel('Текст ответа клиенту').fill('Возврат оформлен.');
    await card.getByRole('button', { name: 'Отправить' }).click();
    await expect.poll(() => api.callsTo('POST', '/v1/tickets/t2/messages').length).toBe(1);
    const [call] = api.callsTo('POST', '/v1/tickets/t2/messages');

    expect(call.headers['if-match']).toBe('4');
    expect(call.headers['idempotency-key']).toMatch(/^[0-9a-f-]{36}$/);
    expect(call.body).toEqual({ text: 'Возврат оформлен.', attachment_ids: [] });
    await expect(card.getByLabel('Текст ответа клиенту')).toHaveValue('');
});

test('reuses the idempotency key when retrying after an unavailable server', async ({ page }) => {
    api.failNext('POST', /^\/v1\/tickets\/t2\/messages$/, 503);
    await openTicket(page, '000002');
    const card = ticketCard(page, '000002');

    await card.getByLabel('Текст ответа клиенту').fill('Повтор');
    await card.getByRole('button', { name: 'Отправить' }).click();
    await expect(card.getByText('HTTP 503').first()).toBeVisible();
    await card.getByRole('button', { name: 'Отправить' }).click();
    await expect.poll(() => api.callsTo('POST', '/v1/tickets/t2/messages').length).toBe(2);
    const [first, second] = api.callsTo('POST', '/v1/tickets/t2/messages');

    expect(second.headers['idempotency-key']).toBe(first.headers['idempotency-key']);
});

test('takes an open ticket into work', async ({ page }) => {
    await openTicket(page, '000001');
    await ticketCard(page, '000001').getByRole('button', { name: 'Взять в работу' }).click();
    await expect.poll(() => api.callsTo('POST', '/v1/tickets/t1/assign').length).toBe(1);
    expect(api.callsTo('POST', '/v1/tickets/t1/assign')[0]?.headers['if-match']).toBe('4');
});

test('changes a classification field', async ({ page }) => {
    await openTicket(page, '000001');
    await chooseOption(ticketCard(page, '000001').getByLabel('Изменить срочность'), 'Низкая');
    await expect.poll(() => api.callsTo('PATCH', '/v1/tickets/t1/classification').length).toBe(1);

    expect(api.callsTo('PATCH', '/v1/tickets/t1/classification')[0]?.body).toEqual({
        urgency: 'low',
        revisions: { urgency: 0 },
    });
});

test('picks a classification value with the keyboard', async ({ page }) => {
    await openTicket(page, '000001');

    const urgency = ticketCard(page, '000001').getByRole('combobox', {
        name: 'Изменить срочность',
    });

    await urgency.focus();
    await urgency.press('ArrowDown');
    await expect(page.getByRole('option', { name: 'Критическая' })).toHaveAttribute('aria-selected', 'true');
    await urgency.press('Home');
    await urgency.press('ArrowDown');
    await urgency.press('Enter');
    await expect(urgency).toHaveAttribute('aria-expanded', 'false');
    await expect.poll(() => api.callsTo('PATCH', '/v1/tickets/t1/classification').length).toBe(1);

    expect(api.callsTo('PATCH', '/v1/tickets/t1/classification')[0]?.body).toMatchObject({
        urgency: 'medium',
    });

    await expect(urgency).toBeEnabled();
    await urgency.focus();
    await urgency.dispatchEvent('keydown', { key: 'в', bubbles: true });
    await expect(page.getByRole('option', { name: 'Высокая' })).toHaveClass(/select__option--active/);
    await urgency.press('Escape');
    await expect(urgency).toHaveAttribute('aria-expanded', 'false');
    expect(api.callsTo('PATCH', '/v1/tickets/t1/classification')).toHaveLength(1);
});

test('closes an open select in a dialog with Escape, keeping the dialog', async ({ page }) => {
    await openTicket(page, '000002');
    await ticketCard(page, '000002').getByRole('button', { name: 'Передать сотруднику' }).click();
    const dialog = page.getByRole('dialog', { name: 'Передать обращение' });
    const assignee = dialog.getByLabel('Новый исполнитель');

    await assignee.click();
    await expect(page.getByRole('option', { name: 'Борис Иванов' })).toBeVisible();
    await assignee.press('Escape');
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await expect(dialog).toBeVisible();
});

test('transfers a ticket to a colleague with a comment', async ({ page }) => {
    await openTicket(page, '000002');
    await ticketCard(page, '000002').getByRole('button', { name: 'Передать сотруднику' }).click();
    const dialog = page.getByRole('dialog', { name: 'Передать обращение' });

    await expect(dialog.getByRole('button', { name: 'Передать' })).toBeDisabled();
    await chooseOption(dialog.getByLabel('Новый исполнитель'), 'Борис Иванов');
    await dialog.getByLabel('Комментарий к передаче').fill('Вопрос по оплате');
    await dialog.getByRole('button', { name: 'Передать' }).click();
    await expect.poll(() => api.callsTo('POST', '/v1/tickets/t2/transfer').length).toBe(1);

    expect(api.callsTo('POST', '/v1/tickets/t2/transfer')[0]?.body).toEqual({
        employee_id: 'e2',
        comment: 'Вопрос по оплате',
    });
});

test('asks before closing, then closes with a note', async ({ page }) => {
    await openTicket(page, '000002');
    await ticketCard(page, '000002').getByRole('button', { name: 'Закрыть обращение' }).click();
    const dialog = page.getByRole('dialog', { name: 'Закрыть обращение?' });

    await expect(dialog.getByText(/перейдёт в «Ожидает оценки»/)).toBeVisible();
    await dialog.getByLabel('Внутренний итог (необязательно)').fill('Возврат');
    await dialog.getByRole('button', { name: 'Закрыть', exact: true }).click();
    await expect.poll(() => api.callsTo('POST', '/v1/tickets/t2/close').length).toBe(1);
    expect(api.callsTo('POST', '/v1/tickets/t2/close')[0]?.body).toEqual({ note: 'Возврат' });
});

test('retries a failed delivery', async ({ page }) => {
    await openTicket(page, '000002');
    await ticketCard(page, '000002').getByRole('button', { name: 'Повторить' }).click();
    await expect.poll(() => api.callsTo('POST', '/v1/messages/msg4/retry').length).toBe(1);
});

test('shows the closure history of a closed ticket', async ({ page }) => {
    await page.getByRole('tab', { name: /Закрытые/ }).click();
    await openTicket(page, '000009');
    const card = ticketCard(page, '000009');

    await expect(card.getByText('Сохранено в памяти')).toBeVisible();
    await expect(card.getByText(/6 сообщений/)).toBeVisible();
    await expect(card.getByRole('button', { name: 'Переоткрыть' })).toBeVisible();
});
