import { useQuery } from '@tanstack/react-query';

import { api } from '@/shared/api/http';
import { queryKeys } from '@/shared/api/query-keys';
import type { SourceExcerpt } from '@/shared/types/api';

export function useSuggestionSource(ticketId: string, memoryId: string) {
    return useQuery({
        queryKey: queryKeys.suggestionSource(ticketId, memoryId),
        queryFn: () => api<SourceExcerpt>(`/v1/tickets/${ticketId}/sources/${memoryId}`),
        retry: false,
        refetchOnWindowFocus: false,
    });
}
