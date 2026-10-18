import { expect, test, type Page } from '@playwright/test';

import { openApp } from './support/app';
import { BOT, PROFILE } from './support/business-fixtures';
import { MockApi } from './support/mock-api';

let api: MockApi;

async function openAdminTab(page: Page, tab: string): Promise<void> {
    await page.getByRole('button', { name: /Управление/ }).click();
    await page.getByRole('tab', { name: tab }).click();
}

test.beforeEach(async ({ page }) => {
    api = await MockApi.install(page);
});

test('walks a new organisation through the setup wizard', async ({ page }) => {
    api.reply('/v1/admin/profile', { ...PROFILE, configured: false });
    await openApp(page);
    await page.getByRole('button', { name: /Управление/ }).click();
    await page.getByRole('button', { name: 'Начать' }).click();

    const wizard = page.getByRole('dialog', { name: 'Настройка под ваш бизнес' });

    await wizard.getByText('Интернет-магазин').click();
    await expect(wizard.getByText('Статус и доставка заказа, Возврат и обмен')).toBeVisible();
    await expect(wizard.getByText(/Выключатся.*Сеть/)).toBeVisible();
    await wizard.getByRole('button', { name: 'Далее' }).click();
    await expect.poll(() => api.callsTo('POST', '/v1/admin/presets/ecommerce/apply').length).toBe(1);
    expect(api.callsTo('POST', '/v1/admin/presets/ecommerce/apply')[0].headers['if-match']).toBe('3');

    await wizard.getByLabel('Чем занимается компания').fill('Магазин бытовой техники');
    await wizard.getByRole('button', { name: 'Далее' }).click();
    await expect.poll(() => api.callsTo('PUT', '/v1/admin/profile').length).toBe(1);

    await wizard.getByLabel('Описание темы «Сеть»').fill('Нет связи или медленно');
    await wizard.getByLabel('Новая тема').fill('Гарантия');
    await wizard.getByRole('button', { name: 'Добавить' }).click();
    await wizard.getByRole('button', { name: 'Далее' }).click();
    await expect.poll(() => api.callsTo('PUT', '/v1/admin/dictionaries').length).toBe(2);
    const [changed, added] = api.callsTo('PUT', '/v1/admin/dictionaries');

    expect(changed.body).toMatchObject({ code: 'network', description: 'Нет связи или медленно' });
    expect(added.body).toEqual({ dimension: 'tag', label: 'Гарантия', description: '', rank: 6, active: true });

    await wizard.getByText('Дружелюбный').click();
    await wizard.getByLabel('Глоссарий').fill('ПВЗ без значения');
    await wizard.getByRole('button', { name: 'Далее' }).click();
    await expect(wizard.getByRole('alert')).toContainText('нет значения');
    await wizard.getByLabel('Глоссарий').fill('ПВЗ — пункт выдачи заказов');
    await wizard.getByRole('button', { name: 'Далее' }).click();
    await expect(wizard.getByText('Шаг 5 из 5')).toBeVisible();
    await wizard.getByRole('button', { name: 'Завершить' }).click();
    await expect(wizard).toBeHidden();

    const finished = api.callsTo('PUT', '/v1/admin/profile').at(-1);

    expect(finished?.body).toMatchObject({
        tone: 'friendly',
        glossary: [{ term: 'ПВЗ', meaning: 'пункт выдачи заказов' }],
        configured: true,
    });
});

test('edits a bot message with variables, preview and reset', async ({ page }) => {
    await openApp(page);
    await openAdminTab(page, 'Диалог с клиентом');
    await page.getByRole('button', { name: 'Изменить «Обращение создано»' }).click();

    const dialog = page.getByRole('dialog', { name: 'Обращение создано' });
    const text = dialog.getByLabel('Текст');
    const preview = dialog.getByLabel('Так увидит клиент');

    await expect(preview).toContainText('Обращение №000123 зарегистрировано.');
    await expect(preview).toContainText('Мои обращения');
    await text.fill('Заявка ');
    await dialog.getByRole('button', { name: 'Номер обращения' }).click();
    await expect(text).toHaveValue('Заявка {ticket_number}');
    await expect(preview).toContainText('Заявка 000123');
    await dialog.getByRole('button', { name: 'Вернуть стандартный текст' }).click();
    await expect(text).toHaveValue('Обращение №{ticket_number} создано. Сотрудник поддержки скоро ответит.');
    await dialog.getByRole('button', { name: 'Сохранить' }).click();
    await expect.poll(() => api.callsTo('PUT', '/v1/admin/templates/ticket_created').length).toBe(1);
});

test('renames the menu buttons', async ({ page }) => {
    await openApp(page);
    await openAdminTab(page, 'Диалог с клиентом');
    const card = page.getByRole('region', { name: 'Кнопки меню' });

    await card.getByLabel('Кнопка списка обращений').fill('Мои заявки');
    await card.getByRole('button', { name: 'Сохранить' }).click();
    await expect.poll(() => api.callsTo('PUT', '/v1/admin/bot').length).toBe(1);
    const [call] = api.callsTo('PUT', '/v1/admin/bot');

    expect(call.headers['if-match']).toBe(String(BOT.version));

    expect(call.body).toEqual({
        policy_url: BOT.policy_url,
        alternative_contact: BOT.alternative_contact,
        menu: { ...BOT.menu, tickets: 'Мои заявки' },
    });
});

test('asks whether a changed policy link is a new edition', async ({ page }) => {
    await openApp(page);
    await openAdminTab(page, 'Организация');
    const card = page.getByRole('region', { name: 'Клиентам в боте' });

    await card.getByLabel('Политика обработки данных').fill('https://line.example/privacy-2026');
    await card.getByRole('button', { name: 'Сохранить' }).click();
    const question = page.getByRole('dialog', { name: 'Ссылка на политику изменилась' });

    await question.getByRole('button', { name: 'Новая редакция' }).click();
    await expect.poll(() => api.callsTo('PUT', '/v1/admin/bot').length).toBe(1);

    expect(api.callsTo('PUT', '/v1/admin/bot')[0].body).toMatchObject({
        policy_url: 'https://line.example/privacy-2026',
        new_policy_edition: true,
    });
});

test('switches the industry preset from the assistant tab', async ({ page }) => {
    await openApp(page);
    await openAdminTab(page, 'ИИ-помощник');
    await expect(page.getByText('Набор не выбран')).toBeHidden();
    await page.getByRole('button', { name: 'Сменить набор' }).click();

    const dialog = page.getByRole('dialog', { name: 'Отраслевой набор' });
    const apply = dialog.getByRole('button', { name: 'Применить набор' });

    await expect(apply).toBeDisabled();
    await dialog.getByText('Интернет-магазин').click();
    await apply.click();
    await expect.poll(() => api.callsTo('POST', '/v1/admin/presets/ecommerce/apply').length).toBe(1);
    await expect(dialog).toBeHidden();
});
