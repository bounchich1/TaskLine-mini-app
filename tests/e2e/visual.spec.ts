import { expect, test } from '@playwright/test';

import { openApp, openSection, openTicket } from './support/app';
import { MockApi } from './support/mock-api';

test.skip(!!process.env.CI, 'Visual baselines are local');

const WIDTHS = [1600, 1280, 800, 375];

for (const width of WIDTHS) {
    test.describe(`at ${width}px`, () => {
        test.use({ viewport: { width, height: 900 } });

        test.beforeEach(async ({ page }) => {
            await MockApi.install(page);
            await openApp(page);
        });

        test('queue', async ({ page }) => {
            await expect(page).toHaveScreenshot(`queue-${width}.png`, { fullPage: true });
        });

        test('ticket card', async ({ page }) => {
            await openTicket(page, '000002');
            await expect(page).toHaveScreenshot(`ticket-${width}.png`, { fullPage: true });
        });

        test('notifications', async ({ page }) => {
            await openSection(page, 'notifications');
            await expect(page.getByText('Клиент оставил оценку')).toBeVisible();
            await expect(page).toHaveScreenshot(`notifications-${width}.png`, { fullPage: true });
        });

        test('date filter calendar', async ({ page }) => {
            await page.clock.setFixedTime(new Date('2026-09-25T12:00:00+07:00'));
            await page.reload();
            await page.getByRole('button', { name: 'Фильтры' }).click();
            await page.getByLabel('С даты').click();
            await expect(page.getByRole('dialog', { name: 'Выбор даты' })).toBeVisible();
            await expect(page).toHaveScreenshot(`calendar-${width}.png`);
        });

        test('profile menu', async ({ page }) => {
            await page.getByRole('button', { name: /^Профиль/ }).click();
            await expect(page.getByRole('dialog', { name: 'Профиль' })).toBeVisible();
            await expect(page).toHaveScreenshot(`profile-${width}.png`);
        });

        test('admin', async ({ page }) => {
            await openSection(page, 'admin');
            await expect(page.getByText('Борис Иванов')).toBeVisible();
            await expect(page).toHaveScreenshot(`admin-${width}.png`, { fullPage: true });
        });
    });
}
