import { useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/shared/api/http';
import { queryKeys } from '@/shared/api/query-keys';
import type { Notification } from '@/shared/types/api';

const REFETCH_MS = 15000;

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () => api<{ items: Notification[] }>('/v1/notifications'),
    refetchInterval: REFETCH_MS,
  });
}

export type NotificationsQuery = ReturnType<typeof useNotifications>;

export const countUnread = (notifications: NotificationsQuery) =>
  notifications.data?.items.filter((item) => !item.read_at).length ?? 0;

export function useMarkNotificationRead() {
  const cache = useQueryClient();
  return (id: string) => {
    void api(`/v1/notifications/${id}/read`, { method: 'POST', body: {} }).then(() =>
      cache.invalidateQueries({ queryKey: queryKeys.notifications }),
    );
  };
}
