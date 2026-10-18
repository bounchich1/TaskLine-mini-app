import { dayKey, formatDayTitle } from '@/shared/lib/format-date';
import type { Notification } from '@/shared/types/api';

export type NotificationGroup = {
    ticketId: string;
    latest: Notification;
    earlier: Notification[];
    unread: number;
};

export type DaySection = {
    key: string;
    title: string;
    groups: NotificationGroup[];
};

export function groupNotifications(items: readonly Notification[]): NotificationGroup[] {
    const byTicket = new Map<string, Notification[]>();

    for (const item of items) {
        byTicket.set(item.ticket_id, [...(byTicket.get(item.ticket_id) ?? []), item]);
    }

    return [...byTicket].map(([ticketId, [latest, ...earlier]]) => ({
        ticketId,
        latest,
        earlier,
        unread: [latest, ...earlier].filter((item) => !item.read_at).length,
    }));
}

export function sectionsByDay(groups: readonly NotificationGroup[], timezone: string, now: number): DaySection[] {
    const sections = new Map<string, DaySection>();

    for (const group of groups) {
        const key = dayKey(group.latest.created_at, timezone);

        const section = sections.get(key) ?? {
            key,
            title: formatDayTitle(group.latest.created_at, timezone, now),
            groups: [],
        };

        section.groups.push(group);
        sections.set(key, section);
    }

    return [...sections.values()];
}
