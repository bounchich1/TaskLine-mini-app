export const PROFILE = {
    preset: 'general',
    description: 'Интернет-провайдер в Красноярске',
    offerings: 'Домашний интернет, ТВ',
    tone: 'formal',
    rules: ['Не обещать компенсацию'],
    glossary: [{ term: 'ЛК', meaning: 'личный кабинет' }],
    configured: true,
    version: 3,
};

const MENU = { tickets: 'Мои обращения', help: 'Помощь', withdraw: 'Отозвать согласие' };

export const BOT = {
    policy_url: 'https://line.example/privacy',
    policy_version: 'v1',
    policy_version_source: 'deployment',
    alternative_contact: 'Телефон 8 800 000-00-00',
    menu: MENU,
    default_menu: MENU,
    version: 5,
};

export const PRESETS = {
    current: 'general',
    items: [
        { id: 'general', title: 'Другая сфера', summary: 'Универсальный набор тем', topics: ['Вопрос'] },
        { id: 'ecommerce', title: 'Интернет-магазин', summary: 'Заказы, доставка, возвраты', topics: ['Доставка'] },
    ],
};

export function presetPreview(id: string) {
    return id === 'ecommerce'
        ? {
              id,
              title: 'Интернет-магазин',
              add: ['Статус и доставка заказа', 'Возврат и обмен'],
              update: ['Оплата и чеки'],
              deactivate: ['Сеть'],
              levels_described: true,
          }
        : { id, title: 'Другая сфера', add: [], update: [], deactivate: [], levels_described: false };
}
