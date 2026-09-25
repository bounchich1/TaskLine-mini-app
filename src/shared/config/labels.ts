import type { Dictionary } from '@/shared/types/api';

type Labels = Readonly<Partial<Record<string, string>>>;

export type Dimension = Dictionary['dimension'];

export const DIMENSIONS = ['tag', 'urgency', 'complexity'] as const;

export const DIMENSION_LABELS: Readonly<Record<Dimension, string>> = {
    tag: 'Тег',
    urgency: 'Срочность',
    complexity: 'Сложность',
};

export const DIMENSION_OBJECT_LABELS: Readonly<Record<Dimension, string>> = {
    tag: 'тег',
    urgency: 'срочность',
    complexity: 'сложность',
};

export const DIMENSION_GROUP_LABELS: Readonly<Record<Dimension, string>> = {
    tag: 'Теги',
    urgency: 'Срочность',
    complexity: 'Сложность',
};

export const STATUS_LABELS: Labels = {
    open: 'Открыта',
    in_progress: 'В работе',
    awaiting_rating: 'Ожидает оценки',
    closed: 'Закрыта',
};

export const statusLabel = (status: string) => STATUS_LABELS[status] ?? status;

const DELIVERY_LABELS: Labels = {
    queued: 'В очереди',
    sending: 'Отправляется',
    retry_wait: 'Повтор отправки',
    delivered: 'Доставлено',
    unknown: 'Доставка не подтверждена',
    failed: 'Не доставлено',
    canceled: 'Отменено',
    received: 'Получено',
    internal: 'Внутренняя запись',
};

export const deliveryLabel = (state: string) => DELIVERY_LABELS[state] ?? state;

const LEARNING_LABELS: Labels = {
    queued: 'В очереди',
    analyzing: 'Анализ переписки',
    persistence_pending: 'Сохранение знаний',
    learned: 'Сохранено в памяти',
    needs_review: 'Нужна проверка',
    failed: 'Ошибка обучения',
    invalidated: 'Данные исключены',
    suppressed: 'Обработка остановлена',
};

export const learningLabel = (status: string) => LEARNING_LABELS[status] ?? status;

const NOTIFICATION_LABELS: Labels = {
    'ticket.created': 'Новое обращение',
    'message.from_client': 'Новое сообщение клиента',
    'ticket.transferred': 'Вам передано обращение',
    'rating.received': 'Клиент оставил оценку',
};

export const notificationLabel = (type: string) => NOTIFICATION_LABELS[type] ?? 'Изменение обращения';

export const ROLE_OPTIONS = [
    ['support', 'Сотрудник поддержки'],
    ['supervisor', 'Руководитель'],
    ['admin', 'Администратор'],
] as const;

const ROLE_LABELS: Labels = Object.fromEntries(ROLE_OPTIONS);

export const roleLabel = (role: string) => ROLE_LABELS[role] ?? role;

const AUTHOR_LABELS: Labels = {
    client: 'Клиент',
    staff: 'Сотрудник',
    bot: 'Бот поддержки',
};

export const authorLabel = (type: string, name: string | null) =>
    (type === 'staff' ? name : null) ?? AUTHOR_LABELS[type] ?? 'Системная запись';

const ATTACHMENT_STATUS_LABELS: Labels = {
    pending: 'Загружается',
    quarantined: 'На проверке',
    infected: 'Файл заблокирован',
    rejected: 'Неподдерживаемый формат',
    unavailable: 'Файл недоступен',
};

export const attachmentStatusLabel = (status: string) => ATTACHMENT_STATUS_LABELS[status] ?? 'Не готов';

const PERMIT_LABELS: Labels = {
    free: 'Свободен',
    running: 'Выполняется',
};

export const permitLabel = (state: string) => PERMIT_LABELS[state] ?? 'Требует проверки';
