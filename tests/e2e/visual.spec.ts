import { expect, test } from '@playwright/test';

import { openApp, openSection, openTicket } from './support/app';
import { MockApi } from './support/mock-api';

// Screenshot baselines are recorded per OS; CI runs on another OS, so they run locally only.
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

    test('admin', async ({ page }) => {
      await openSection(page, 'admin');
      await expect(page.getByText('Борис Иванов')).toBeVisible();
      await expect(page).toHaveScreenshot(`admin-${width}.png`, { fullPage: true });
    });
  });
}
