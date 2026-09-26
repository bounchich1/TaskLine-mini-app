import { expect, test } from '@playwright/test';

import { openApp, openTicket, ticketCard } from './support/app';
import { MockApi } from './support/mock-api';
import { SUPERVISOR_SESSION, SUPPORT_SESSION } from './support/staff';

test('support staff cannot act on a colleague ticket or open administration', async ({ page }) => {
    await MockApi.install(page, SUPPORT_SESSION);
    await openApp(page);
    const navigation = page.getByRole('navigation', { name: 'Основная навигация' });

    await expect(navigation.getByRole('button', { name: /Управление/ })).toHaveCount(0);
    await openTicket(page, '000002');
    const card = ticketCard(page, '000002');

    await expect(card.getByRole('button', { name: 'Передать сотруднику' })).toHaveCount(0);
    await expect(card.getByRole('button', { name: 'Закрыть обращение' })).toHaveCount(0);
    await expect(card.getByRole('combobox', { name: 'Изменить срочность' })).toBeDisabled();
});

test('supervisors see only system health in administration', async ({ page }) => {
    await MockApi.install(page, SUPERVISOR_SESSION);
    await openApp(page);
    await page.getByRole('button', { name: /Управление/ }).click();

    await expect(page.getByRole('tab')).toHaveText(['Состояние системы']);
    await expect(page.getByRole('button', { name: 'Не повторять' })).toBeVisible();
});
