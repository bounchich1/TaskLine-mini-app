import { expect, test, type Page } from '@playwright/test';

import { chooseOption, openApp, openTicket, ticketCard } from './support/app';
import { OPEN_TICKETS } from './support/fixtures';
import { MockApi } from './support/mock-api';
import { SUPPORT_SESSION } from './support/staff';

let api: MockApi;

async function openIncidents(page: Page): Promise<void> {
    const navigation = page.getByRole('navigation', { name: 'Основная навигация' });

    await navigation.getByRole('button', { name: /^Инциденты/ }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Инциденты' })).toBeVisible();
}

test.describe('supervisor', () => {
    test.beforeEach(async ({ page }) => {
        api = await MockApi.install(page);
        await openApp(page);
    });

    test('creates an incident from a detector suggestion', async ({ page }) => {
        await openIncidents(page);
        const suggestion = page.getByRole('article', { name: 'Подсказка: Сеть — ул. Ленина' });

        await expect(suggestion).toContainText('12 обращений «Сеть» за 15 мин (обычно 2)');
        await expect(suggestion.getByRole('list', { name: 'Общие слова' })).toContainText('ул. Ленина');
        await suggestion.getByRole('button', { name: 'Создать инцидент' }).click();

        const dialog = page.getByRole('dialog', { name: 'Создать инцидент по подсказке' });
        const second = dialog.getByRole('checkbox', { name: /№000002/ });

        await expect(dialog.getByRole('checkbox', { name: /№000001/ })).toBeChecked();
        await expect(second).not.toBeChecked();
        await second.check();
        await dialog.getByRole('button', { name: 'Создать инцидент' }).click();

        await expect.poll(() => api.callsTo('POST', '/v1/incidents').length).toBe(1);

        expect(api.callsTo('POST', '/v1/incidents')[0]?.body).toMatchObject({
            suggestion_id: 'inc1',
            tag: 'network',
            title: 'Сеть — ул. Ленина',
            match_terms: ['ул. Ленина', 'интернета'],
            notify: true,
            eta: null,
            ticket_ids: ['t1', 't2'],
        });

        await expect(page.getByRole('heading', { level: 1, name: 'Авария на ул. Мира' })).toBeVisible();
    });

    test('dismisses a suggestion', async ({ page }) => {
        await openIncidents(page);
        await page.getByRole('button', { name: 'Не инцидент' }).click();

        await expect.poll(() => api.callsTo('POST', '/v1/incidents/inc1/dismiss').length).toBe(1);
        expect(api.callsTo('POST', '/v1/incidents/inc1/dismiss')[0]?.headers['if-match']).toBe('1');
    });

    test('writes to every client and resolves an open incident', async ({ page }) => {
        await openIncidents(page);
        await page.getByRole('tab', { name: /Идут/ }).click();
        await page.getByRole('button', { name: /Авария на ул. Мира/ }).click();
        await expect(page.getByText('отправлено 2 клиентам')).toBeVisible();

        await page.getByRole('button', { name: 'Написать всем' }).click();
        const message = page.getByRole('dialog', { name: 'Написать всем' });

        await message.getByLabel('Сообщение клиентам').fill('Бригада заменила коммутатор, проверяем.');
        await message.getByRole('button', { name: 'Отправить' }).click();
        await expect.poll(() => api.callsTo('POST', '/v1/incidents/inc2/messages').length).toBe(1);

        expect(api.callsTo('POST', '/v1/incidents/inc2/messages')[0]?.body).toEqual({
            text: 'Бригада заменила коммутатор, проверяем.',
        });

        await page.getByRole('button', { name: 'Завершить инцидент' }).click();
        const resolve = page.getByRole('dialog', { name: 'Завершить инцидент' });

        await resolve.getByRole('checkbox', { name: 'Попросить клиентов оценить поддержку' }).check();
        await resolve.getByRole('button', { name: 'Завершить и закрыть обращения' }).click();
        await expect.poll(() => api.callsTo('POST', '/v1/incidents/inc2/resolve').length).toBe(1);

        const [call] = api.callsTo('POST', '/v1/incidents/inc2/resolve');

        expect(call.headers['if-match']).toBe('3');
        expect(call.body).toMatchObject({ request_rating: true });
    });

    test('links selected queue tickets to an open incident', async ({ page }) => {
        await page.getByRole('checkbox', { name: 'Выбрать обращение №000001' }).check();

        await page
            .getByRole('region', { name: 'Массовые действия' })
            .getByRole('button', { name: 'В инцидент…' })
            .click();

        const dialog = page.getByRole('dialog', { name: 'Связать с инцидентом' });

        await chooseOption(dialog.getByRole('combobox', { name: 'Открытый инцидент' }), 'Авария на ул. Мира');
        await dialog.getByRole('button', { name: 'Связать' }).click();

        await expect(dialog.getByRole('status')).toHaveText('Связано: 1 обращение. Пропущено: в другом инциденте.');
        expect(api.callsTo('POST', '/v1/incidents/inc2/tickets')[0]?.body).toEqual({ ticket_ids: ['t1'] });
    });

    test('saves detector settings', async ({ page }) => {
        await openIncidents(page);
        await page.getByRole('button', { name: 'Настройки детектора' }).click();

        const dialog = page.getByRole('dialog', { name: 'Детектор инцидентов' });

        await dialog.getByRole('checkbox', { name: /Привязывать новые похожие обращения/ }).check();
        await dialog.getByLabel('Не меньше обращений').fill('5');
        await dialog.getByRole('button', { name: 'Сохранить' }).click();

        await expect.poll(() => api.callsTo('PUT', '/v1/incidents/settings').length).toBe(1);

        expect(api.callsTo('PUT', '/v1/incidents/settings')[0]?.body).toEqual({
            detection: true,
            auto_link: true,
            min_tickets: 5,
            spike_factor: 4,
            window_minutes: 15,
            relink_hours: 6,
        });
    });
});

test('shows the incident on a linked ticket and lets the assignee unlink it', async ({ page }) => {
    api = await MockApi.install(page, SUPPORT_SESSION);
    const ticket = OPEN_TICKETS.find((item) => item.id === 't2');

    api.reply('/v1/tickets/t2', {
        ...ticket,
        client_id: 'client-t2',
        assignee_id: SUPPORT_SESSION.employee.id,
        incident_id: 'inc2',
        incident_title: 'Авария на ул. Мира',
        incident_status: 'open',
    });

    await openApp(page);

    await expect(
        page.getByRole('navigation', { name: 'Основная навигация' }).getByRole('button', { name: /Инциденты/ }),
    ).toHaveCount(0);

    await openTicket(page, '000002');
    const banner = ticketCard(page, '000002').getByRole('note');

    await expect(banner).toContainText('Инцидент: Авария на ул. Мира');
    await banner.getByRole('button', { name: 'Отвязать' }).click();

    await expect.poll(() => api.callsTo('DELETE', '/v1/incidents/inc2/tickets/t2').length).toBe(1);
});
