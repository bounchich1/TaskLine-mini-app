import { notificationLabel } from '@/shared/config/labels';
import { plural, type PluralForms } from '@/shared/lib/plural';
import type { Notification, NotificationTicket } from '@/shared/types/api';
import type { IconName } from '@/shared/ui';

export type NotificationTone = 'neutral' | 'warning' | 'danger';

const ICONS: Partial<Record<string, IconName>> = {
    'ticket.created': 'inbox',
    'message.from_client': 'send',
    'ticket.transferred': 'user',
    'rating.received': 'star',
    'ticket.auto_closed': 'clock',
    'ticket.offered': 'inbox',
    'note.mention': 'note',
    'ticket.close_failed': 'alert',
};

const NOUNS: Partial<Record<string, PluralForms>> = {
    'ticket.created': ['новое обращение', 'новых обращения', 'новых обращений'],
    'message.from_client': ['сообщение клиента', 'сообщения клиента', 'сообщений клиента'],
    'ticket.transferred': ['передача', 'передачи', 'передач'],
    'rating.received': ['оценка', 'оценки', 'оценок'],
    'ticket.auto_closed': ['автозакрытие', 'автозакрытия', 'автозакрытий'],
    'ticket.offered': ['предложение', 'предложения', 'предложений'],
    'note.mention': ['упоминание', 'упоминания', 'упоминаний'],
};

const SLA_NOUN: PluralForms = ['предупреждение о сроке', 'предупреждения о сроке', 'предупреждений о сроке'];
const OTHER_NOUN: PluralForms = ['изменение', 'изменения', 'изменений'];
const ABOUT_CLOSING = new Set(['rating.received', 'ticket.auto_closed']);

const isSla = (type: string) => type.startsWith('sla.');

export function notificationIcon({ type }: Notification): IconName {
    return ICONS[type] ?? (isSla(type) ? 'alert' : 'bell');
}

export function notificationTone({ type }: Notification): NotificationTone {
    if (!isSla(type)) {
        return 'neutral';
    }

    return type.endsWith('_warning') ? 'warning' : 'danger';
}

export function notificationTitle({ type, payload, ticket }: Notification): string {
    if (type === 'ticket.created' && payload.topic && ticket) {
        return `Новое обращение по теме «${ticket.tag_label}»`;
    }

    if (type === 'rating.received' && payload.value) {
        return `Оценка ${payload.value} из 10`;
    }

    return notificationLabel(type);
}

export function notificationDetail({ type, payload, preview, actor_name: actor, ticket }: Notification) {
    if (type === 'note.mention' && actor) {
        return `${actor} упомянул(а) вас`;
    }

    if (type === 'ticket.transferred' && (actor ?? payload.comment)) {
        return [actor ? `От ${actor}` : null, payload.comment].filter(Boolean).join(': ');
    }

    return preview ?? ticket?.description ?? null;
}

export function earlierSummary(items: readonly Notification[]): string | null {
    const counts = new Map<PluralForms, number>();

    for (const { type } of items) {
        const noun = NOUNS[type] ?? (isSla(type) ? SLA_NOUN : OTHER_NOUN);

        counts.set(noun, (counts.get(noun) ?? 0) + 1);
    }

    const parts = [...counts].map(([noun, count]) => (count === 1 ? noun[0] : `${count} ${plural(count, noun)}`));

    return parts.length ? `Ранее: ${parts.join(', ')}` : null;
}

export function ticketState(ticket: NotificationTicket, me: string): string {
    switch (ticket.status) {
        case 'open':
            return 'Не назначено';
        case 'in_progress':
            return ticket.assignee_id === me ? 'У вас в работе' : `В работе у ${ticket.assignee_name ?? 'коллеги'}`;
        case 'awaiting_rating':
            return 'Ждёт оценки';
        default:
            return 'Закрыто';
    }
}

export function isStale({ type, payload, ticket }: Notification, me: string): boolean {
    if (!ticket || ticket.purged_at) {
        return true;
    }

    if (ticket.status === 'closed' || ticket.status === 'awaiting_rating') {
        return !ABOUT_CLOSING.has(type);
    }

    const takenByColleague = ticket.assignee_id !== null && ticket.assignee_id !== me;

    return takenByColleague && (type === 'ticket.created' || (isSla(type) && payload.stage === 1));
}
