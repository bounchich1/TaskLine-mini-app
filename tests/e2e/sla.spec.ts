import { expect, test } from '@playwright/test';

import { openApp, openTicket, ticketCard, ticketRow } from './support/app';
import { MockApi } from './support/mock-api';
import { SLA_NOW } from './support/sla-fixtures';

let api: MockApi;

const lastListCall = () => api.callsTo('GET', '/v1/tickets').at(-1)?.search;

test.beforeEach(async ({ page }) => {
    api = await MockApi.install(page);
    await page.clock.setFixedTime(SLA_NOW);
    await openApp(page);
});

test('shows deadlines in the queue, most at risk first', async ({ page }) => {
    await expect.poll(() => lastListCall()?.get('sort')).toBe('sla_risk');
    await expect(page.getByRole('columnheader', { name: 'До нарушения' })).toBeVisible();
    await expect(page.getByText('ответ просрочен на 30 мин')).toBeVisible();
    await expect(page.getByText('решение через 3 ч')).toBeVisible();
    await expect(ticketRow(page, '000001')).toBeVisible();
});

test('filters the queue to tickets at risk', async ({ page }) => {
    const toggle = page.getByRole('button', { name: /Под угрозой/ });

    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(toggle).toContainText('1');
    await toggle.click();
    await expect.poll(() => lastListCall()?.get('sla')).toBe('at_risk');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText('решение через 3 ч')).toBeHidden();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByText('решение через 3 ч')).toBeVisible();
});

test('shows both clocks on the ticket and waits for the client', async ({ page }) => {
    await openTicket(page, '000002');
    const card = ticketCard(page, '000002');

    await expect(card.getByText('решение через 3 ч')).toBeVisible();
    await expect(card.getByText(/^дан /)).toBeVisible();
    await expect(card.getByText('Решение', { exact: true })).toBeVisible();
    await card.getByRole('button', { name: 'Ждём клиента' }).click();
    await expect.poll(() => api.callsTo('POST', '/v1/tickets/t2/wait').length).toBe(1);
    const [call] = api.callsTo('POST', '/v1/tickets/t2/wait');

    expect(call.headers['if-match']).toBe('4');
});

test('edits the SLA calendar and targets', async ({ page }) => {
    const year = new Date(SLA_NOW).getUTCFullYear();

    await page.getByRole('button', { name: /Управление/ }).click();
    await page.getByRole('tab', { name: 'SLA' }).click();
    await page.getByLabel('Критическая: первый ответ, минут').fill('10');
    await page.getByLabel('Низкая: первый ответ, минут').fill('240');
    await page.getByLabel('Низкая: решение, часов').fill('40');
    await expect(page.getByLabel('Сб: начало', { exact: true })).toBeDisabled();
    await page.getByRole('button', { name: `Праздники РФ ${year}–${year + 1}` }).click();
    await page.getByLabel('Сообщать клиенту срок ответа').check();
    await page.getByRole('button', { name: 'Сохранить' }).click();
    await expect.poll(() => api.callsTo('PUT', '/v1/admin/sla').length).toBe(1);
    const [call] = api.callsTo('PUT', '/v1/admin/sla');
    const body = call.body as Record<string, unknown>;

    expect(call.headers['if-match']).toBe('3');

    expect(body).toMatchObject({
        enabled: true,
        client_eta: true,
        waiting_reminder_hours: 24,
        waiting_close_hours: 72,
        week: {
            1: [['09:00', '18:00']],
            5: [
                ['09:00', '13:00'],
                ['14:00', '17:00'],
            ],
            6: [],
            7: [],
        },
    });

    expect(body.holidays).toEqual(expect.arrayContaining([`${year}-01-01`, `${year + 1}-06-12`, '2026-11-04']));

    expect(body.policies).toEqual(
        expect.arrayContaining([
            { urgency: 'critical', tag: '*', first_response_minutes: 10, resolution_minutes: 240 },
            { urgency: 'low', tag: '*', first_response_minutes: 240, resolution_minutes: 2400 },
            { urgency: 'high', tag: 'network', first_response_minutes: 20, resolution_minutes: 240 },
        ]),
    );
});
