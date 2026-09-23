import { expect, test } from '@playwright/test';

import { openApp, ticketCard } from './support/app';
import { MockApi } from './support/mock-api';

let api: MockApi;

test.beforeEach(async ({ page }) => {
  api = await MockApi.install(page);
  await openApp(page);
});

test('lists notifications and opens the ticket of one', async ({ page }) => {
  await page.getByRole('button', { name: /Уведомления/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: /Уведомления/ })).toBeVisible();
  await expect(page.getByText('Клиент оставил оценку')).toBeVisible();
  await page.getByRole('button', { name: /Новое обращение/ }).click();
  await expect.poll(() => api.callsTo('POST', '/v1/notifications/n1/read').length).toBe(1);
  await expect(ticketCard(page, '000003')).toBeVisible();
});

test('shows each admin tab', async ({ page }) => {
  await page.getByRole('button', { name: /Управление/ }).click();
  await expect(page.getByText('Борис Иванов')).toBeVisible();
  await expect(page.getByText('Заблокирован')).toBeVisible();
  await page.getByRole('tab', { name: 'Справочники' }).click();
  await expect(page.getByText('В архиве')).toBeVisible();
  await page.getByRole('tab', { name: 'Шаблоны бота' }).click();
  await expect(page.getByText('ticket_created')).toBeVisible();
  await page.getByRole('tab', { name: 'Организация' }).click();
  await expect(page.getByLabel('Название')).toHaveValue('ООО «Линия»');
  await page.getByRole('tab', { name: 'Состояние системы' }).click();
  await expect(page.getByText('Требует проверки')).toBeVisible();
  await expect(page.getByText('Незавершённые отправки')).toBeVisible();
  await page.getByRole('tab', { name: 'Журнал' }).click();
  await expect(page.getByText('admin.settings')).toBeVisible();
});

test('adds an employee', async ({ page }) => {
  await page.getByRole('button', { name: /Управление/ }).click();
  await page.getByRole('button', { name: 'Добавить сотрудника' }).click();
  const dialog = page.getByRole('dialog', { name: 'Добавить сотрудника' });
  await dialog.getByLabel('MAX ID').fill('2001');
  await dialog.getByLabel('Имя').fill('Галина');
  await dialog.getByLabel('Роль').selectOption('supervisor');
  await dialog.getByRole('button', { name: 'Сохранить' }).click();
  await expect.poll(() => api.callsTo('POST', '/v1/admin/employees').length).toBe(1);
  const [call] = api.callsTo('POST', '/v1/admin/employees');
  expect(call.body).toEqual({
    max_user_id: '2001',
    name: 'Галина',
    role: 'supervisor',
    blocked: false,
  });
  expect(call.headers['if-match']).toBe('0');
});

test('saves organization settings with their version', async ({ page }) => {
  await page.getByRole('button', { name: /Управление/ }).click();
  await page.getByRole('tab', { name: 'Организация' }).click();
  await page.getByLabel('Название').fill('ООО «Линия 2»');
  await page.getByRole('button', { name: 'Сохранить' }).click();
  await expect.poll(() => api.callsTo('PUT', '/v1/admin/settings').length).toBe(1);
  const [call] = api.callsTo('PUT', '/v1/admin/settings');
  expect(call.headers['if-match']).toBe('5');
  expect(call.body).toEqual({ name: 'ООО «Линия 2»', timezone: 'Asia/Krasnoyarsk' });
});

test('requires evidence before resolving an uncertain delivery', async ({ page }) => {
  await page.getByRole('button', { name: /Управление/ }).click();
  await page.getByRole('tab', { name: 'Состояние системы' }).click();
  await page.getByRole('button', { name: 'Не повторять' }).click();
  const dialog = page.getByRole('dialog', { name: 'Проверить результат отправки' });
  const confirm = dialog.getByRole('button', { name: 'Не повторять отправку' });
  await expect(confirm).toBeDisabled();
  await dialog.getByLabel('Подтверждение проверки').fill('Клиент подтвердил получение');
  await confirm.click();
  await expect.poll(() => api.callsTo('POST', '/v1/messages/msg4/cancel').length).toBe(1);
});
