import type { MenuLabels, Template } from './types';

type TemplateInfo = { title: string; when: string };

type Stage = { title: string; codes: readonly string[] };

export const TEMPLATE_INFO: Readonly<Partial<Record<string, TemplateInfo>>> = {
    consent_request: {
        title: 'Запрос согласия',
        when: 'Первое сообщение клиента, пока нет согласия на обработку данных',
    },
    consent_accepted: { title: 'Согласие получено', when: 'Клиент нажал «Согласен»' },
    consent_declined: { title: 'Отказ от согласия', when: 'Клиент нажал «Отказаться»' },
    help: { title: 'Помощь', when: 'Кнопка помощи или команда /help' },
    withdraw_confirm: { title: 'Подтверждение отзыва согласия', when: 'Кнопка отзыва согласия' },
    consent_withdrawn: { title: 'Согласие отозвано', when: 'Клиент подтвердил отзыв согласия' },
    ticket_created: { title: 'Обращение создано', when: 'Сразу после первого сообщения' },
    ticket_created_eta: {
        title: 'Обращение создано, со сроком',
        when: 'Включено «Сообщать клиенту срок ответа» в SLA',
    },
    outside_hours: { title: 'Обращение вне рабочего времени', when: 'Клиент написал в нерабочее время' },
    ticket_reopened: { title: 'Обращение снова в работе', when: 'Сотрудник вернул обращение в работу' },
    waiting_reminder: { title: 'Напоминание клиенту', when: 'Ждём ответа клиента дольше срока из SLA' },
    auto_closed: { title: 'Автоматическое закрытие', when: 'Клиент так и не ответил' },
    ticket_closed: { title: 'Обращение закрыто, просьба оценить', when: 'Сотрудник закрыл обращение' },
    rating_reminder: { title: 'Напоминание об оценке', when: 'Клиент не поставил оценку' },
    rating_invalid: { title: 'Непонятная оценка', when: 'Клиент прислал не число от 1 до 10' },
    rating_accepted: { title: 'Спасибо за оценку', when: 'Оценка принята' },
    rating_attempts_exhausted: { title: 'Попытки оценки закончились', when: 'Несколько непонятных оценок подряд' },
    rating_expired: { title: 'Срок оценки истёк', when: 'Клиент не оценил вовремя' },
    buffer_expired: { title: 'Сообщения до согласия устарели', when: 'Клиент долго не давал согласие' },
    buffer_full: { title: 'Слишком много сообщений до согласия', when: 'Клиент пишет, не дав согласия' },
    attachment_rejected: { title: 'Файл не принят', when: 'Вложение не прошло проверку' },
    input_too_long: { title: 'Слишком длинное сообщение', when: 'Сообщение длиннее допустимого' },
    unsupported_input: { title: 'Неподдерживаемое сообщение', when: 'Стикер, геолокация и т. п.' },
    technical_error: { title: 'Техническая ошибка', when: 'Действие не удалось выполнить' },
    expired_button: { title: 'Устаревшая кнопка', when: 'Клиент нажал кнопку из старого сообщения' },
};

const TEMPLATE_STAGES: readonly Stage[] = [
    {
        title: 'Первый контакт',
        codes: [
            'consent_request',
            'consent_accepted',
            'consent_declined',
            'help',
            'withdraw_confirm',
            'consent_withdrawn',
        ],
    },
    { title: 'Обращение создано', codes: ['ticket_created', 'ticket_created_eta', 'outside_hours', 'ticket_reopened'] },
    { title: 'Ожидание ответа клиента', codes: ['waiting_reminder', 'auto_closed'] },
    {
        title: 'Закрытие и оценка',
        codes: [
            'ticket_closed',
            'rating_reminder',
            'rating_invalid',
            'rating_accepted',
            'rating_attempts_exhausted',
            'rating_expired',
        ],
    },
    {
        title: 'Ошибки и ограничения',
        codes: [
            'buffer_expired',
            'buffer_full',
            'attachment_rejected',
            'input_too_long',
            'unsupported_input',
            'technical_error',
            'expired_button',
        ],
    },
];

export function groupTemplates(templates: readonly Template[]): { title: string; items: Template[] }[] {
    const known = new Set(TEMPLATE_STAGES.flatMap((stage) => stage.codes));

    const groups = TEMPLATE_STAGES.map((stage) => ({
        title: stage.title,
        items: stage.codes.flatMap((code) => templates.filter((template) => template.code === code)),
    }));

    const others = templates.filter((template) => !known.has(template.code));

    return [...groups, { title: 'Другие', items: others }].filter((group) => group.items.length > 0);
}

const MENU_TEMPLATES = new Set([
    'consent_accepted',
    'ticket_created',
    'ticket_created_eta',
    'outside_hours',
    'ticket_reopened',
    'auto_closed',
    'rating_accepted',
    'rating_attempts_exhausted',
    'rating_expired',
    'help',
]);

export function showsMenu(code: string): boolean {
    return MENU_TEMPLATES.has(code);
}

const ETA_TEMPLATES = new Set(['ticket_created_eta', 'outside_hours']);

export type Variable = { name: string; label: string };

export function variablesFor(code: string): Variable[] {
    return [
        { name: 'ticket_number', label: 'Номер обращения' },
        ...(ETA_TEMPLATES.has(code) ? [{ name: 'eta', label: 'Срок ответа' }] : []),
        { name: 'policy_url', label: 'Ссылка на политику' },
        { name: 'alternative_contact', label: 'Другой способ связи' },
        { name: 'menu_tickets', label: 'Кнопка обращений' },
        { name: 'menu_help', label: 'Кнопка помощи' },
        { name: 'menu_withdraw', label: 'Кнопка отзыва согласия' },
    ];
}

type PreviewContext = { policyUrl: string; alternativeContact: string; menu: MenuLabels };

export function previewText(body: string, context: PreviewContext): string {
    const values: Record<string, string> = {
        ticket_number: '000123',
        eta: 'сегодня до 11:30',
        policy_url: context.policyUrl,
        alternative_contact: context.alternativeContact,
        menu_tickets: context.menu.tickets,
        menu_help: context.menu.help,
        menu_withdraw: context.menu.withdraw,
    };

    return body.replace(/\{([^{}]+)\}/g, (match, name: string) => values[name] ?? match);
}
