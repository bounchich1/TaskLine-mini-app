import { expect, test, type Page } from '@playwright/test';

import { openApp, openSection } from './support/app';
import { MockApi } from './support/mock-api';

let api: MockApi;

test.beforeEach(async ({ page }) => {
    api = await MockApi.install(page);
    await openApp(page);
    await openSection(page, 'admin');
    await expect(page.getByText('Борис Иванов')).toBeVisible();
});

const rows = (page: Page) => page.locator('.employee-row');
const row = (page: Page, name: string) => rows(page).filter({ hasText: name });
const search = (page: Page) => page.getByLabel('Поиск по имени или MAX ID');

test('filters employees by status and search', async ({ page }) => {
    const filters = page.getByRole('tablist', { name: 'Статус сотрудников' });

    await expect(filters.getByRole('tab', { name: 'Все 5' })).toHaveAttribute('aria-selected', 'true');
    await filters.getByRole('tab', { name: /Ожидают входа/ }).click();
    await expect(rows(page)).toHaveCount(1);
    await expect(row(page, 'Галина Орлова')).toContainText('Ожидает первого входа');

    await filters.getByRole('tab', { name: /Заблокированные/ }).click();
    await expect(rows(page)).toHaveCount(1);
    await expect(row(page, 'Вера Петрова')).toBeVisible();

    await filters.getByRole('tab', { name: /Все/ }).click();
    await search(page).fill('1002');
    await expect(rows(page)).toHaveCount(1);
    await expect(filters.getByRole('tab', { name: 'Активные 1' })).toBeVisible();
    await search(page).fill('нет такого');
    await expect(page.getByText('Никого не нашли')).toBeVisible();
});

test('shows only the actions an administrator may take on each employee', async ({ page }) => {
    await expect(row(page, 'Анна Смирнова')).toContainText('Вы');
    await expect(row(page, 'Анна Смирнова').getByRole('button')).toHaveText(['Изменить']);
    await expect(row(page, 'Дмитрий Козлов').getByRole('button')).toHaveCount(0);
    await expect(row(page, 'Борис Иванов').getByRole('button')).toHaveCount(2);
    await expect(row(page, 'Борис Иванов').getByRole('button', { name: 'Заблокировать Борис Иванов' })).toBeVisible();
    await expect(row(page, 'Вера Петрова').getByRole('button')).toHaveText(['Изменить', 'Разблокировать']);
});

test('blocks an employee only after confirmation', async ({ page }) => {
    const block = row(page, 'Борис Иванов').getByRole('button', { name: 'Заблокировать' });
    const dialog = page.getByRole('dialog', { name: 'Заблокировать Борис Иванов?' });

    await block.click();
    await expect(dialog).toContainText('открытые сессии завершатся');
    await dialog.getByRole('button', { name: 'Отмена' }).click();
    expect(api.callsTo('PATCH', '/v1/admin/employees/e2')).toHaveLength(0);

    await block.click();
    await dialog.getByRole('button', { name: 'Заблокировать' }).click();
    await expect.poll(() => api.callsTo('PATCH', '/v1/admin/employees/e2').length).toBe(1);
    const [call] = api.callsTo('PATCH', '/v1/admin/employees/e2');

    expect(call.body).toEqual({ blocked: true });
    expect(call.headers['if-match']).toBe('1');
    await expect(dialog).toBeHidden();
});

test('unblocks an employee in one step', async ({ page }) => {
    await row(page, 'Вера Петрова').getByRole('button', { name: 'Разблокировать' }).click();
    await expect.poll(() => api.callsTo('PATCH', '/v1/admin/employees/e3').length).toBe(1);
    expect(api.callsTo('PATCH', '/v1/admin/employees/e3')[0]?.body).toEqual({ blocked: false });
});

test('corrects the MAX ID of an invite but not of an active employee', async ({ page }) => {
    const dialog = page.getByRole('dialog', { name: 'Изменить сотрудника' });

    await row(page, 'Галина Орлова').getByRole('button', { name: 'Изменить' }).click();
    await expect(dialog.getByText('Можно исправить, пока сотрудник не вошёл в приложение.')).toBeVisible();
    await dialog.getByLabel('MAX ID').fill('2004');
    await dialog.getByRole('button', { name: 'Сохранить' }).click();
    await expect.poll(() => api.callsTo('PATCH', '/v1/admin/employees/e4').length).toBe(1);
    expect(api.callsTo('PATCH', '/v1/admin/employees/e4')[0]?.body).toEqual({ max_user_id: '2004' });

    await row(page, 'Борис Иванов').getByRole('button', { name: 'Изменить' }).click();
    await expect(dialog.getByLabel('MAX ID')).not.toBeEditable();
    await expect(dialog.getByText('Сотрудник уже вошёл в приложение, MAX ID закреплён.')).toBeVisible();
});

test('lets an administrator change only their own name', async ({ page }) => {
    const dialog = page.getByRole('dialog', { name: 'Изменить сотрудника' });

    await row(page, 'Анна Смирнова').getByRole('button', { name: 'Изменить' }).click();
    await expect(dialog.getByLabel('MAX ID')).not.toBeEditable();
    await expect(dialog.getByLabel('Роль')).toHaveValue('Администратор');
    await expect(dialog.getByLabel('Роль')).not.toBeEditable();
    await dialog.getByLabel('Имя').fill('Анна С.');
    await dialog.getByRole('button', { name: 'Сохранить' }).click();
    await expect.poll(() => api.callsTo('PATCH', '/v1/admin/employees/e1').length).toBe(1);
    expect(api.callsTo('PATCH', '/v1/admin/employees/e1')[0]?.body).toEqual({ name: 'Анна С.' });
});
