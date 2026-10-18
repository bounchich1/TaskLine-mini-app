import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';

import { api } from '@/shared/api/http';
import { queryKeys } from '@/shared/api/query-keys';
import type { Notification, NotificationSettings } from '@/shared/types/api';

const REFETCH_MS = 15000;

type NotificationList = { items: Notification[] };

export function useNotifications() {
    return useQuery({
        queryKey: queryKeys.notifications,
        queryFn: () => api<NotificationList>('/v1/notifications'),
        refetchInterval: REFETCH_MS,
    });
}

export type NotificationsQuery = ReturnType<typeof useNotifications>;

export function countUnread(notifications: NotificationsQuery): number {
    const tickets = new Set(notifications.data?.items.filter((item) => !item.read_at).map((item) => item.ticket_id));

    return tickets.size;
}

export function useMarkTicketRead() {
    const cache = useQueryClient();

    return useCallback(
        (ticketId: string) => {
            const readAt = new Date().toISOString();

            cache.setQueryData<NotificationList>(queryKeys.notifications, (list) =>
                list
                    ? {
                          items: list.items.map((item) =>
                              item.ticket_id === ticketId && !item.read_at ? { ...item, read_at: readAt } : item,
                          ),
                      }
                    : list,
            );

            void api('/v1/notifications/read', { method: 'POST', body: { ticket_id: ticketId } }).finally(() =>
                cache.invalidateQueries({ queryKey: queryKeys.notifications }),
            );
        },
        [cache],
    );
}

export function useReadOpenTicket(ticketId: string | null, notifications: NotificationsQuery) {
    const markRead = useMarkTicketRead();

    const unread = ticketId
        ? (notifications.data?.items.some((item) => item.ticket_id === ticketId && !item.read_at) ?? false)
        : false;

    useEffect(() => {
        if (ticketId && unread) {
            markRead(ticketId);
        }
    }, [ticketId, unread, markRead]);
}

export function useNotificationSettings() {
    return useQuery({
        queryKey: queryKeys.notificationSettings,
        queryFn: () => api<NotificationSettings>('/v1/notifications/settings'),
    });
}

export function useSaveNotificationSettings(onSaved: () => void) {
    const cache = useQueryClient();

    return useMutation({
        mutationFn: (settings: NotificationSettings) =>
            api<NotificationSettings>('/v1/notifications/settings', { method: 'PUT', body: settings }),
        onSuccess: (settings) => {
            cache.setQueryData(queryKeys.notificationSettings, settings);
            onSaved();
        },
    });
}
