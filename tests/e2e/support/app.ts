import { expect, type Locator, type Page } from '@playwright/test';

export async function openApp(page: Page): Promise<void> {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: /Обращения/ })).toBeVisible();
}

export function ticketRow(page: Page, number: string) {
    return page.getByRole('button', { name: new RegExp(`№${number}`) });
}

export async function openTicket(page: Page, number: string): Promise<void> {
    await ticketRow(page, number).click();
    await expect(page.getByRole('region', { name: `Обращение №${number}` })).toBeVisible();
}

export async function chooseOption(select: Locator, option: string): Promise<void> {
    await select.click();
    await select.page().getByRole('option', { name: option, exact: true }).click();
    await expect(select).toHaveAttribute('aria-expanded', 'false');
}

export function ticketCard(page: Page, number: string) {
    return page.getByRole('region', { name: `Обращение №${number}` });
}

const SECTIONS = { tickets: 'Обращения', notifications: 'Уведомления', reports: 'Отчёты', admin: 'Управление' };

export async function openSection(page: Page, section: keyof typeof SECTIONS): Promise<void> {
    const navigation = page.getByRole('navigation', { name: 'Основная навигация' });
    const tab = navigation.getByRole('button', { name: new RegExp(`^${SECTIONS[section]}`) });

    if (section === 'admin' && (await tab.count()) === 0) {
        await page.getByRole('banner').getByRole('button', { name: 'Ещё' }).click();
        await page.getByRole('dialog', { name: 'Ещё' }).getByRole('button', { name: 'Управление' }).click();

        return;
    }

    await tab.click();
}
