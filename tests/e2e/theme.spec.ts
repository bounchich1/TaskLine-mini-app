import { expect, test, type Page } from '@playwright/test';

import { openApp } from './support/app';
import { MockApi } from './support/mock-api';

test.beforeEach(async ({ page }) => {
    await MockApi.install(page);
});

const scheme = (page: Page) => page.locator('html');

const profile = (page: Page) => page.getByRole('button', { name: 'Профиль: Анна Смирнова' });

test('follows the device theme until a theme is picked, then remembers it', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await openApp(page);
    await expect(scheme(page)).toHaveAttribute('data-scheme', 'dark');

    await profile(page).click();
    const panel = page.getByRole('dialog', { name: 'Профиль' });

    await expect(panel.getByRole('radio', { name: 'Как на устройстве' })).toBeFocused();
    await panel.locator('label', { hasText: 'Светлая' }).click();
    await expect(scheme(page)).toHaveAttribute('data-scheme', 'light');
    await page.keyboard.press('Escape');
    await expect(panel).toHaveCount(0);
    await expect(profile(page)).toBeFocused();

    await page.reload();
    await expect(scheme(page)).toHaveAttribute('data-scheme', 'light');

    await profile(page).click();
    await expect(panel.getByRole('radio', { name: 'Светлая' })).toBeChecked();
    await page.keyboard.press('ArrowUp');
    await expect(panel.getByRole('radio', { name: 'Как на устройстве' })).toBeChecked();
    await expect(scheme(page)).toHaveAttribute('data-scheme', 'dark');
    await page.emulateMedia({ colorScheme: 'light' });
    await expect(scheme(page)).toHaveAttribute('data-scheme', 'light');
});
