import { dayBoundary } from '@/shared/lib/day-boundary';
import { dayKey, formatDate } from '@/shared/lib/format-date';
import { plural } from '@/shared/lib/plural';
import type { Incident, IncidentStatus, IncidentUpdateKind } from '@/shared/types/incidents';

const TICKETS = ['обращение', 'обращения', 'обращений'] as const;
const MINUTE = 60000;

export const ticketsCount = (count: number) => `${count} ${plural(count, TICKETS)}`;

const STATUS_LABELS: Record<IncidentStatus, string> = {
    suggested: 'Подсказка',
    open: 'Идёт',
    resolved: 'Решён',
    dismissed: 'Не инцидент',
};

export const incidentStatusLabel = (status: IncidentStatus) => STATUS_LABELS[status];

const UPDATE_LABELS: Record<IncidentUpdateKind, string> = {
    opened: 'Инцидент создан',
    message: 'Сообщение всем',
    eta: 'Новый срок',
    resolved: 'Инцидент завершён',
    reopened: 'Инцидент возобновлён',
    dismissed: 'Подсказка отклонена',
};

export const updateLabel = (kind: IncidentUpdateKind) => UPDATE_LABELS[kind];

export function detectionSummary(incident: Pick<Incident, 'detection' | 'tag_label'>): string | null {
    const detection = incident.detection;

    if (!detection) {
        return null;
    }

    return (
        `${ticketsCount(detection.count)} «${incident.tag_label}» за ${detection.window_minutes} мин ` +
        `(обычно ${Math.round(detection.baseline)})`
    );
}

export function zonedInstant(day: string, time: string, timezone: string): string | null {
    const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());

    if (!day || !match) {
        return null;
    }

    const minutes = Number(match[1]) * 60 + Number(match[2]);

    return new Date(Date.parse(dayBoundary(day, timezone)) + minutes * MINUTE).toISOString();
}

export function zonedParts(value: string | null, timezone: string): { day: string; time: string } {
    if (!value) {
        return { day: '', time: '' };
    }

    const time = new Intl.DateTimeFormat('ru-RU', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
    }).format(new Date(value));

    return { day: dayKey(value, timezone), time };
}

export const formatEta = (value: string | null, timezone: string) =>
    value ? formatDate(value, timezone) : 'не указан';

export function parseTerms(value: string): string[] {
    const terms = value
        .split(/[,;\n]/)
        .map((term) => term.trim())
        .filter((term) => term.length >= 3);

    return [...new Map(terms.map((term) => [term.toLowerCase(), term])).values()].slice(0, 20);
}
