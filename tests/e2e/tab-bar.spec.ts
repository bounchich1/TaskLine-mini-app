import { expect, test, type Page } from '@playwright/test';

import { openApp } from './support/app';
import { MockApi } from './support/mock-api';
import { SUPERVISOR_SESSION, SUPPORT_SESSION } from './support/staff';

test.use({ viewport: { width: 360, height: 760 } });

const navigation = (page: Page) => page.getByRole('navigation', { name: 'Основная навигация' });

test('an admin gets five equal tabs with Управление and the connection under «Ещё»', async ({ page }) => {
    await MockApi.install(page);
    await openApp(page);

    await expect(navigation(page).getByRole('button')).toHaveText([
        'Обращения',
        /^Уведомления\d+$/,
        /^Инциденты, есть новые подсказки$/,
        'Отчёты',
    ]);

    const labels = page.locator('.app-header__nav-label, .account-menu__tab-label');

    await expect(labels).toHaveCount(5);

    for (const label of await labels.all()) {
        expect(await label.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
    }

    const more = page.getByRole('banner').getByRole('button', { name: 'Ещё' });

    await more.click();
    const panel = page.getByRole('dialog', { name: 'Ещё' });

    await expect(panel).toBeInViewport({ ratio: 1 });
    await expect(panel).toContainText(/Обновляется в реальном времени|Нет связи/);
    await panel.getByRole('button', { name: 'Управление' }).click();

    await expect(panel).toHaveCount(0);
    await expect(page.getByRole('heading', { level: 1, name: 'Управление' })).toBeVisible();
    await expect(more).toHaveAttribute('aria-current', 'page');
});

test('support staff keep «Профиль» as the last tab', async ({ page }) => {
    await MockApi.install(page, SUPPORT_SESSION);
    await openApp(page);

    const profile = page.getByRole('button', { name: 'Профиль: Борис Иванов' });

    await expect(navigation(page).getByRole('button')).toHaveCount(2);
    await expect(profile).toHaveText(/Профиль/);
    await profile.click();

    const panel = page.getByRole('dialog', { name: 'Профиль' });

    await expect(panel).toBeInViewport({ ratio: 1 });
    await expect(panel).toContainText(/Обновляется в реальном времени|Нет связи/);
    await expect(panel.getByRole('button', { name: 'Управление' })).toHaveCount(0);
    await panel.locator('label', { hasText: 'Тёмная' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-scheme', 'dark');
});

test('a supervisor without suggestions sees the open incident count', async ({ page }) => {
    const api = await MockApi.install(page, SUPERVISOR_SESSION);

    api.reply('/v1/incidents', { items: [], counts: { suggested: 0, open: 3, resolved: 0 } });
    await openApp(page);

    await expect(navigation(page).getByRole('button', { name: /^Инциденты/ })).toHaveText('Инциденты3');
});
