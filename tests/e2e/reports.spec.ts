import { expect, test } from '@playwright/test';

import { openApp, openSection, ticketCard } from './support/app';
import { MockApi } from './support/mock-api';
import { SUPPORT_SESSION } from './support/staff';

test('shows overview numbers with comparisons, charts and a period switch', async ({ page }) => {
    const api = await MockApi.install(page);

    await openApp(page);
    await openSection(page, 'reports');

    await expect(page.getByRole('heading', { level: 1, name: 'Отчёты' })).toBeVisible();
    await expect(page.getByRole('img', { name: 'Новые и закрытые обращения по дням' })).toBeVisible();
    await expect(page.getByRole('img', { name: 'Открытые обращения на конец дня' })).toBeVisible();

    const flow = page.getByRole('region', { name: 'Поток обращений' });

    await expect(flow.getByText('Новых обращений')).toBeVisible();
    await expect(flow.getByText('44')).toBeVisible();
    await expect(flow.getByText('+10%').first()).toBeVisible();
    await expect(page.getByRole('region', { name: 'Скорость' }).getByText('в рабочих часах')).toBeVisible();
    await expect(page.getByRole('region', { name: 'Оценки клиентов' }).getByText('9,2')).toBeVisible();

    await page.getByRole('button', { name: '30 дней' }).click();
    await expect.poll(() => api.callsTo('GET', '/v1/reports/overview').length).toBeGreaterThan(1);
    const last = api.callsTo('GET', '/v1/reports/overview').at(-1);

    expect(last?.search.get('from')).not.toBe(api.callsTo('GET', '/v1/reports/overview')[0]?.search.get('from'));
});

test('lists employee KPIs without ranking and hides small-sample medians', async ({ page }) => {
    await MockApi.install(page);
    await openApp(page);
    await openSection(page, 'reports');
    await page.getByRole('tab', { name: 'Команда' }).click();

    const anna = page.getByRole('row', { name: /Анна Смирнова/ });
    const boris = page.getByRole('row', { name: /Борис Иванов/ });

    await expect(anna).toContainText('2 / 5');
    await expect(anna).toContainText('15 мин');
    await expect(anna).toContainText('8,7 · 11');
    await expect(anna).toContainText('40,0 ч');
    await expect(anna).toContainText('60%');
    await expect(boris).toContainText('—');
    await expect(page.getByText(/скрыты, если обращений меньше 5/)).toBeVisible();
});

test('shows topic growth, AI value and low ratings that open the ticket', async ({ page }) => {
    await MockApi.install(page);
    await openApp(page);
    await openSection(page, 'reports');

    await page.getByRole('tab', { name: 'Темы' }).click();
    await expect(page.getByRole('region', { name: 'Быстрее всего растут' })).toContainText('Сеть');
    await expect(page.getByRole('row', { name: /Сеть/ })).toContainText('+150%');

    await page.getByRole('tab', { name: 'ИИ' }).click();
    await expect(page.getByRole('meter', { name: 'Тема без правок' })).toHaveAttribute('aria-valuenow', '87');
    await expect(page.getByText('Ответов из черновика ИИ')).toBeVisible();
    await expect(page.getByText('61%')).toBeVisible();
    await expect(page.getByText('5,32 ₽')).toBeVisible();
    await expect(page.getByText('ИИ не ответил вовремя — 2')).toBeVisible();

    await page.getByRole('tab', { name: 'Качество' }).click();
    await page.getByRole('button', { name: '№000002' }).click();
    await expect(ticketCard(page, '000002')).toBeVisible();
});

test('exports the current table as CSV', async ({ page }) => {
    const api = await MockApi.install(page);

    await openApp(page);
    await openSection(page, 'reports');
    await page.getByRole('tab', { name: 'Команда' }).click();

    const pending = page.waitForEvent('download');

    await page.getByRole('button', { name: 'CSV' }).click();
    const download = await pending;

    await download.path();
    expect(download.suggestedFilename()).toMatch(/^taskline-team-\d{4}-\d{2}-\d{2}_\d{4}-\d{2}-\d{2}\.csv$/);
    expect(api.callsTo('GET', '/v1/reports/team/export')).toHaveLength(1);
    expect(api.callsTo('GET', '/v1/reports/team/export')[0]?.search.get('format')).toBe('csv');
});

test('keeps reports away from support staff', async ({ page }) => {
    await MockApi.install(page, SUPPORT_SESSION);
    await openApp(page);

    const navigation = page.getByRole('navigation', { name: 'Основная навигация' });

    await expect(navigation.getByRole('button', { name: /Отчёты/ })).toHaveCount(0);
});
