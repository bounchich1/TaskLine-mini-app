import { useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/shared/api/http';
import { queryKeys } from '@/shared/api/query-keys';
import type { Ticket } from '@/shared/types/api';

export function useTicket(id: string) {
    return useQuery({
        queryKey: queryKeys.ticketDetail(id),
        queryFn: () => api<Ticket>(`/v1/tickets/${id}`),
    });
}

export function useRefreshTicket(id: string) {
    const cache = useQueryClient();

    return async () => {
        await Promise.all([
            cache.invalidateQueries({ queryKey: queryKeys.ticketDetail(id) }),
            cache.invalidateQueries({ queryKey: queryKeys.ticketMessages(id) }),
            cache.invalidateQueries({ queryKey: queryKeys.tickets }),
        ]);
    };
}
