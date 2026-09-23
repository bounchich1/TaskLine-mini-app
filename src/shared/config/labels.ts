import type { Dictionary } from '@/shared/types/api';

/** Russian labels for API codes. Unknown codes fall back as noted per lookup. */
type Labels = Readonly<Partial<Record<string, string>>>;

export type Dimension = Dictionary['dimension'];

export const DIMENSIONS = ['tag', 'urgency', 'complexity'] as const;

export const DIMENSION_LABELS: Readonly<Record<Dimension, string>> = {
  tag: 'Тег',
  urgency: 'Срочность',
  complexity: 'Сложность',
};

/** "Изменить тег" and the like. */
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

/** Falls back to the code itself. */
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

/** Falls back to the code itself. */
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

/** Falls back to the code itself. */
export const learningLabel = (status: string) => LEARNING_LABELS[status] ?? status;

const NOTIFICATION_LABELS: Labels = {
  'ticket.created': 'Новое обращение',
  'message.from_client': 'Новое сообщение клиента',
  'ticket.transferred': 'Вам передано обращение',
  'rating.received': 'Клиент оставил оценку',
};

export const notificationLabel = (type: string) =>
  NOTIFICATION_LABELS[type] ?? 'Изменение обращения';

const PROFILE_ROLE_LABELS: Labels = {
  support: 'Специалист поддержки',
  admin: 'Администратор',
};

/** The signed-in employee's role, under their name in the sidebar. */
export const profileRoleLabel = (role: string) => PROFILE_ROLE_LABELS[role] ?? 'Руководитель';

const EMPLOYEE_ROLE_LABELS: Labels = {
  admin: 'Администратор',
  supervisor: 'Руководитель',
};

/** A role in the admin employee list. */
export const employeeRoleLabel = (role: string) => EMPLOYEE_ROLE_LABELS[role] ?? 'Поддержка';

/** Roles offered in the employee form, in display order. */
export const ROLE_OPTIONS = [
  ['support', 'Сотрудник поддержки'],
  ['supervisor', 'Руководитель'],
  ['admin', 'Администратор'],
] as const;

const AUTHOR_LABELS: Labels = {
  client: 'Клиент',
  staff: 'Сотрудник',
  bot: 'Бот поддержки',
};

/** Staff messages show the employee's name when the server provides it. */
export const authorLabel = (type: string, name: string | null) =>
  (type === 'staff' ? name : null) ?? AUTHOR_LABELS[type] ?? 'Системная запись';

const ATTACHMENT_STATUS_LABELS: Labels = {
  pending: 'Загружается',
  quarantined: 'На проверке',
  infected: 'Файл заблокирован',
  rejected: 'Неподдерживаемый формат',
  unavailable: 'Файл недоступен',
};

export const attachmentStatusLabel = (status: string) =>
  ATTACHMENT_STATUS_LABELS[status] ?? 'Не готов';

const PERMIT_LABELS: Labels = {
  free: 'Свободен',
  running: 'Выполняется',
};

/** An AI call slot. */
export const permitLabel = (state: string) => PERMIT_LABELS[state] ?? 'Требует проверки';
