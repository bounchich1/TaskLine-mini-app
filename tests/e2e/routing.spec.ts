import { expect, test } from '@playwright/test';

import { openApp, openSection, openTicket, ticketCard } from './support/app';
import { MockApi } from './support/mock-api';

let api: MockApi;

test.beforeEach(async ({ page }) => {
    api = await MockApi.install(page);
    await openApp(page);
});

test('writes an internal note that mentions a colleague', async ({ page }) => {
    await openTicket(page, '000002');
    const card = ticketCard(page, '000002');

    await card.getByRole('tab', { name: 'Заметка' }).click();
    const note = card.getByLabel('Текст заметки для сотрудников');

    await note.fill('Глянь договор ');
    await note.press('End');
    await note.pressSequentially('@Бор');
    await card.getByRole('option', { name: /Борис Иванов/ }).click();
    await expect(note).toHaveValue('Глянь договор @Борис Иванов ');
    await card.getByRole('button', { name: 'Сохранить заметку' }).click();

    await expect.poll(() => api.callsTo('POST', '/v1/tickets/t2/notes').length).toBe(1);

    expect(api.callsTo('POST', '/v1/tickets/t2/notes')[0]?.body).toEqual({
        text: 'Глянь договор @Борис Иванов',
        mention_ids: ['e2'],
    });
});

test('inserts a reply template with variables and reports which template was used', async ({ page }) => {
    await openTicket(page, '000002');
    const card = ticketCard(page, '000002');
    const reply = card.getByLabel('Текст ответа клиенту');

    await reply.pressSequentially('/перез');
    await reply.press('Enter');
    await expect(reply).toHaveValue('Перезагрузите роутер, пожалуйста. Обращение №000002, Анна Смирнова.');
    await card.getByRole('button', { name: 'Отправить' }).click();

    await expect.poll(() => api.callsTo('POST', '/v1/tickets/t2/messages').length).toBe(1);
    expect(api.callsTo('POST', '/v1/tickets/t2/messages')[0]?.body).toMatchObject({ macro_id: 'mac1' });
});

test('marks replies started from the AI draft and logs the insert', async ({ page }) => {
    await openTicket(page, '000002');
    const card = ticketCard(page, '000002');

    await card.getByRole('button', { name: 'Вставить в черновик' }).click();
    await card.getByRole('button', { name: 'Отправить' }).click();

    await expect.poll(() => api.callsTo('POST', '/v1/tickets/t2/messages').length).toBe(1);
    expect(api.callsTo('POST', '/v1/tickets/t2/messages')[0]?.body).toMatchObject({ draft_origin: 'ai' });

    expect(api.callsTo('POST', '/v1/tickets/t2/events').map((call) => call.body)).toContainEqual({
        kind: 'draft_inserted',
    });
});

test('asks before sending right after a colleague replied', async ({ page }) => {
    await openTicket(page, '000002');
    const card = ticketCard(page, '000002');

    api.failNext('POST', /\/v1\/tickets\/t2\/messages$/, 409, {
        code: 'reply_collision',
        message: 'Борис Иванов ответил(а) клиенту меньше минуты назад. Отправить всё равно?',
    });

    await card.getByLabel('Текст ответа клиенту').fill('Проверили, всё в порядке');
    await card.getByRole('button', { name: 'Отправить' }).click();
    const dialog = page.getByRole('dialog', { name: 'Коллега уже ответил' });

    await expect(dialog.getByText(/Борис Иванов ответил/)).toBeVisible();
    await dialog.getByRole('button', { name: 'Отправить всё равно' }).click();

    await expect.poll(() => api.callsTo('POST', '/v1/tickets/t2/messages').length).toBe(2);
    expect(api.callsTo('POST', '/v1/tickets/t2/messages')[1]?.body).toMatchObject({ confirm_collision: true });
});

test('switches presence from the profile menu', async ({ page }) => {
    await page.getByRole('button', { name: /Профиль/ }).click();
    await page.getByText('На линии').click();

    await expect.poll(() => api.callsTo('PUT', '/v1/presence').length).toBe(1);
    expect(api.callsTo('PUT', '/v1/presence')[0]?.body).toEqual({ presence: 'online' });
});

test('filters the queue by owner and team and runs a bulk action', async ({ page }) => {
    await page.getByRole('button', { name: 'Мои', exact: true }).click();
    await expect.poll(() => api.callsTo('GET', '/v1/tickets').at(-1)?.search.get('assignee')).toBe('e1');

    await page.getByRole('button', { name: /Первая линия/ }).click();
    await expect.poll(() => api.callsTo('GET', '/v1/tickets').at(-1)?.search.get('team')).toBe('team1');

    await page.getByRole('button', { name: 'Все', exact: true }).click();
    await page.getByRole('checkbox', { name: 'Выбрать обращение №000001' }).check();
    await expect(page.getByRole('region', { name: 'Массовые действия' })).toContainText('Выбрано 1 обращение');
    await page.getByRole('combobox', { name: 'Изменить срочность' }).click();
    await page.getByRole('option', { name: 'Высокая', exact: true }).click();

    await expect.poll(() => api.callsTo('POST', '/v1/tickets/bulk').length).toBe(1);

    expect(api.callsTo('POST', '/v1/tickets/bulk')[0]?.body).toEqual({
        action: 'classify',
        urgency: 'high',
        ids: ['t1'],
    });

    await expect(page.getByRole('region', { name: 'Массовые действия' })).toContainText('Готово: 1.');
});

test('manages teams and routing rules in the admin panel', async ({ page }) => {
    await openSection(page, 'admin');
    await page.getByRole('tab', { name: 'Команды' }).click();
    await expect(page.getByText('на линии 1 · в очереди 3')).toBeVisible();
    await page.getByRole('button', { name: 'Создать команду' }).click();

    const dialog = page.getByRole('dialog', { name: 'Новая команда' });

    await dialog.getByLabel('Название').fill('Биллинг');
    await dialog.getByRole('checkbox', { name: /Борис Иванов/ }).check();
    await dialog.getByRole('button', { name: 'Сохранить' }).click();

    await expect.poll(() => api.callsTo('POST', '/v1/admin/teams').length).toBe(1);

    expect(api.callsTo('POST', '/v1/admin/teams')[0]?.body).toMatchObject({
        name: 'Биллинг',
        members: [{ employee_id: 'e2', skills: [] }],
    });

    await page.getByRole('tab', { name: 'Маршрутизация' }).click();
    await page.getByRole('button', { name: 'Добавить правило' }).click();
    await page.getByRole('button', { name: 'Сохранить' }).click();

    await expect.poll(() => api.callsTo('PUT', '/v1/admin/routing-rules').length).toBe(1);
    const saved = api.callsTo('PUT', '/v1/admin/routing-rules').at(0);

    expect(saved?.headers['if-match']).toBe('4');
    expect((saved?.body as { rules: unknown[] }).rules).toHaveLength(2);
});
