import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import type { ConnectionState } from '@/shared/api/events-stream';
import { api } from '@/shared/api/http';
import { queryKeys } from '@/shared/api/query-keys';
import type { TicketPage } from '@/shared/types/api';

const FALLBACK_REFETCH_MS = 15000;

export function useTicketList(query: string, connection: ConnectionState) {
  const list = useInfiniteQuery({
    queryKey: queryKeys.ticketList(query),
    queryFn: ({ pageParam }) =>
      api<TicketPage>(
        `/v1/tickets?${query}${pageParam ? `&cursor=${encodeURIComponent(pageParam)}` : ''}`,
      ),
    initialPageParam: null as string | null,
    getNextPageParam: (page) => page.next_cursor,
    refetchInterval: connection === 'reconnecting' ? FALLBACK_REFETCH_MS : false,
  });
  const rows = useMemo(() => list.data?.pages.flatMap((page) => page.items) ?? [], [list.data]);
  return { list, rows, counts: list.data?.pages.at(0)?.counts };
}

export type TicketList = ReturnType<typeof useTicketList>;
