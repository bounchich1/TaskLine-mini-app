import { dayKey, formatDayTitle } from '@/shared/lib/format-date';
import type { Notification } from '@/shared/types/notifications';

export type NotificationGroup = {
    key: string;
    ticketId: string | null;
    latest: Notification;
    earlier: Notification[];
    unread: number;
};

export type DaySection = {
    key: string;
    title: string;
    groups: NotificationGroup[];
};

export const groupKey = (item: Notification): string => item.ticket_id ?? `notification:${item.id}`;

export function groupNotifications(items: readonly Notification[]): NotificationGroup[] {
    const byKey = new Map<string, Notification[]>();

    for (const item of items) {
        byKey.set(groupKey(item), [...(byKey.get(groupKey(item)) ?? []), item]);
    }

    return [...byKey].map(([key, [latest, ...earlier]]) => ({
        key,
        ticketId: latest.ticket_id,
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
