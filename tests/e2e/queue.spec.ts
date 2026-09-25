import { expect, test, type Locator } from '@playwright/test';

import { chooseOption, openApp, ticketRow } from './support/app';
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
    await expect(page.getByText('Показано 2 из 3')).toBeVisible();
});

test('loads the next page on demand', async ({ page }) => {
    await openApp(page);
    await page.getByRole('button', { name: 'Показать ещё' }).click();
    await expect(ticketRow(page, '000003')).toBeVisible();
    expect(api.callsTo('GET', '/v1/tickets').at(-1)?.search.get('cursor')).toBe('page-2');
    await expect(page.getByText('Показано 3 из 3')).toBeVisible();
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
    const tag = page.getByLabel('Тег');

    await chooseOption(tag, 'Сеть');
    await expect.poll(() => api.callsTo('GET', '/v1/tickets').at(-1)?.search.get('tag')).toBe('network');
    await tag.click();
    await expect(page.getByRole('option', { name: 'Оплата · архив' })).toHaveCount(1);
    await tag.press('Escape');
    await page.getByRole('button', { name: 'Сбросить' }).click();
    await expect(tag).toHaveText('Все');
    await expect(ticketRow(page, '000002')).toBeVisible();
});

const calendarDay = (calendar: Locator, name: string) => calendar.getByRole('button', { name, exact: true });

test('filters by a date range picked in the calendar', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-09-25T12:00:00+07:00'));
    await openApp(page);
    await page.getByRole('button', { name: 'Фильтры' }).click();
    const from = page.getByLabel('С даты');
    const to = page.getByLabel('По дату');

    await expect(from).toHaveText('Любая');
    await from.click();
    const calendar = page.getByRole('dialog', { name: 'Выбор даты' });

    await expect(calendar.getByRole('grid', { name: 'Сентябрь 2026' })).toBeVisible();
    await expect(calendarDay(calendar, '25 сентября 2026 г.')).toBeFocused();
    await calendarDay(calendar, '10 сентября 2026 г.').click();
    await expect(calendar).toHaveCount(0);
    await expect(from).toHaveText('10.09.2026');

    await expect
        .poll(() => api.callsTo('GET', '/v1/tickets').at(-1)?.search.get('from'))
        .toBe('2026-09-09T17:00:00.000Z');

    await to.click();
    await expect(calendarDay(calendar, '9 сентября 2026 г.')).toHaveAttribute('aria-disabled', 'true');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('PageDown');
    await expect(calendar.getByRole('grid', { name: 'Октябрь 2026' })).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(to).toHaveText('26.10.2026');
    await expect(to).toBeFocused();

    await expect
        .poll(() => api.callsTo('GET', '/v1/tickets').at(-1)?.search.get('to'))
        .toBe('2026-10-26T17:00:00.000Z');

    await from.click();
    await page.keyboard.press('Escape');
    await expect(calendar).toHaveCount(0);
    await expect(from).toBeFocused();
    await from.click();
    await calendar.getByRole('button', { name: 'Очистить' }).click();
    await expect(from).toHaveText('Любая');
    await expect.poll(() => api.callsTo('GET', '/v1/tickets').at(-1)?.search.has('from')).toBe(false);
});

test('sorts the queue', async ({ page }) => {
    await openApp(page);
    await chooseOption(page.getByLabel('Сортировка'), 'Сначала новые');
    await expect.poll(() => api.callsTo('GET', '/v1/tickets').at(-1)?.search.get('sort')).toBe('newest');
});

test('returns to the sign-in screen when the session expires', async ({ page }) => {
    api.failNext('GET', /^\/v1\/tickets$/, 401);
    await page.goto('/');
    await expect(page.getByText(/Сессия истекла/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Повторить вход' })).toBeVisible();
});
