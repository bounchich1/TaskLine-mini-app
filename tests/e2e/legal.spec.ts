import { expect, test } from '@playwright/test';

test('serves the privacy policy without signing in', async ({ page }) => {
    const apiCalls: string[] = [];

    page.on('request', (request) => {
        if (new URL(request.url()).pathname.startsWith('/v1/')) {
            apiCalls.push(request.url());
        }
    });

    await page.goto('/legal/');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        'Политика конфиденциальности и обработки персональных данных бота технической поддержки TaskLine',
    );

    await expect(page.locator('#consent')).toContainText('Нажимая «Согласен», я даю TaskLineInternet согласие');
    await expect(page.getByRole('heading', { level: 2 })).toHaveCount(8);
    await expect(page.getByRole('link', { name: '+79130416810' }).first()).toHaveAttribute('href', 'tel:+79130416810');
    expect(apiCalls).toEqual([]);
});

test('follows the color scheme chosen in the app', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/legal/');
    await expect(page.locator('html')).not.toHaveAttribute('data-scheme', /./);

    await page.evaluate(() => {
        localStorage.setItem('color-scheme', 'dark');
    });

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-scheme', 'dark');
    await expect(page.locator('html')).toHaveCSS('background-color', 'rgb(23, 24, 28)');
});
