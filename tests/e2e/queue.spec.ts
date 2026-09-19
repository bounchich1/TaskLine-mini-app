import { expect, test } from '@playwright/test';

import { openApp, ticketRow } from './support/app';
import { MockApi } from './support/mock-api';

let api: MockApi;

test.beforeEach(async ({ page }) => {
  api = await MockApi.install(page);
});

test('signs in through demo auth and shows the first page of the queue', async ({ page }) => {
  await openApp(page);
  expect(api.callsTo('POST', '/v1/auth/dev')).toHaveLength(1);
  await expect(ticketRow(page, '000001')).toBeVisible();
  await expect(ticketRow(page, '000002')).toBeVisible();
  await expect(ticketRow(page, '000003')).toHaveCount(0);
  await expect(page.getByText('Показано 2 обращений')).toBeVisible();
});

test('loads the next page on demand', async ({ page }) => {
  await openApp(page);
  await page.getByRole('button', { name: 'Показать ещё' }).click();
  await expect(ticketRow(page, '000003')).toBeVisible();
  expect(api.callsTo('GET', '/v1/tickets').at(-1)?.search.get('cursor')).toBe('page-2');
  await expect(page.getByText('Показано 3 обращений')).toBeVisible();
});

test('switches to closed tickets with their ratings', async ({ page }) => {
  await openApp(page);
  await page.getByRole('tab', { name: /Закрытые/ }).click();
  await expect(ticketRow(page, '000009')).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Оценка' })).toBeVisible();
  await expect(page.getByText('9 / 10')).toBeVisible();
  expect(api.callsTo('GET', '/v1/tickets').at(-1)?.search.get('tab')).toBe('closed');
});

test('searches by number after a pause in typing', async ({ page }) => {
  await openApp(page);
  await page.getByLabel('Поиск по номеру или тексту').fill('000003');
  await expect(ticketRow(page, '000001')).toHaveCount(0);
  await expect(ticketRow(page, '000003')).toBeVisible();
  expect(api.callsTo('GET', '/v1/tickets').at(-1)?.search.get('q')).toBe('000003');
});

test('filters by dictionary values and resets the filters', async ({ page }) => {
  await openApp(page);
  await page.getByRole('button', { name: 'Фильтры' }).click();
  await page.getByLabel('Тег').selectOption('network');
  await expect.poll(() => api.callsTo('GET', '/v1/tickets').at(-1)?.search.get('tag')).toBe('network');
  await expect(page.getByLabel('Тег').locator('option', { hasText: 'Оплата (архив)' })).toHaveCount(1);
  await page.getByRole('button', { name: 'Сбросить' }).click();
  // The unfiltered list is served from the query cache, so there may be no new request.
  await expect(page.getByLabel('Тег')).toHaveValue('');
  await expect(ticketRow(page, '000002')).toBeVisible();
});

test('sorts the queue', async ({ page }) => {
  await openApp(page);
  await page.getByLabel('Сортировка').selectOption('newest');
  await expect.poll(() => api.callsTo('GET', '/v1/tickets').at(-1)?.search.get('sort')).toBe('newest');
});

test('returns to the sign-in screen when the session expires', async ({ page }) => {
  api.failNext('GET', /^\/v1\/tickets$/, 401);
  await page.goto('/');
  await expect(page.getByText(/Сессия истекла/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Повторить вход' })).toBeVisible();
});
