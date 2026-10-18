import { expect, test, type Page } from '@playwright/test';

import { openApp, openSection, openTicket } from './support/app';
import { MockApi } from './support/mock-api';
import { SLA_NOW } from './support/sla-fixtures';

let api: MockApi;

test.beforeEach(async ({ page }) => {
    api = await MockApi.install(page);
    await page.clock.setFixedTime(SLA_NOW);
    await openApp(page);
});

const notificationRow = (page: Page, number: string) =>
    page
        .getByRole('main')
        .getByRole('button')
        .filter({ hasText: `№${number}` });

test('groups notifications by ticket under day headings', async ({ page }) => {
    await openSection(page, 'notifications');
    await expect(page.getByText('Новое в 3 обращениях')).toBeVisible();

    const today = page.getByRole('region', { name: 'Сегодня' });

    await expect(today.getByRole('button')).toHaveCount(3);

    const mine = notificationRow(page, '000002');

    await expect(mine).toContainText('Новое сообщение клиента');
    await expect(mine).toContainText('Списание было 28 февраля, карта на 4417.');
    await expect(mine).toContainText('У вас в работе');
    await expect(mine).toContainText('Ранее: передача');
    await expect(mine.getByLabel('Непрочитанных: 2')).toBeVisible();

    const late = notificationRow(page, '000001');

    await expect(late).toContainText('Первый ответ просрочен');
    await expect(late).toContainText('ответ просрочен на');

    const rated = page.getByRole('region', { name: 'Вчера' }).getByRole('button');

    await expect(rated).toContainText('Оценка 9 из 10');
    await expect(rated).toContainText('Закрыто');
});

test('opening a ticket from the queue marks its notifications read', async ({ page }) => {
    const badge = page.getByRole('navigation', { name: 'Основная навигация' }).getByRole('button').nth(1);

    await expect(badge).toContainText('3');
    await openTicket(page, '000002');

    await expect
        .poll(() => api.callsTo('POST', '/v1/notifications/read').map((call) => call.body))
        .toEqual([{ ticket_id: 't2' }]);

    await expect(badge).toContainText('2');
});

test('saves personal notification settings', async ({ page }) => {
    await openSection(page, 'notifications');
    await page.getByRole('button', { name: 'Настройки уведомлений' }).click();

    const dialog = page.getByRole('dialog', { name: 'Настройки уведомлений' });

    await dialog.getByText('Только по моим темам').click();
    await expect(dialog.getByRole('button', { name: 'Сохранить' })).toBeDisabled();
    await dialog.getByText('Сеть', { exact: true }).click();
    await dialog.getByText('Дублировать в MAX').click();
    await dialog.getByRole('button', { name: 'Сохранить' }).click();
    await expect(dialog).toBeHidden();

    expect(api.callsTo('PUT', '/v1/notifications/settings').map((call) => call.body)).toEqual([
        { new_tickets: 'topics', topics: ['network'], max_alerts: true },
    ]);
});
