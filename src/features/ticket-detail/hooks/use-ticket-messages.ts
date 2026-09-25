import { useInfiniteQuery } from '@tanstack/react-query';

import { api } from '@/shared/api/http';
import { queryKeys } from '@/shared/api/query-keys';
import type { Message } from '@/shared/types/api';

type MessagePage = { items: Message[]; has_more: boolean; next_before: number };

export function useTicketMessages(id: string) {
    return useInfiniteQuery({
        queryKey: queryKeys.ticketMessages(id),
        queryFn: ({ pageParam }) =>
            api<MessagePage>(`/v1/tickets/${id}/messages${pageParam ? `?before=${pageParam}` : ''}`),
        initialPageParam: undefined as number | undefined,
        getNextPageParam: (page) => (page.has_more ? page.next_before : undefined),
    });
}
