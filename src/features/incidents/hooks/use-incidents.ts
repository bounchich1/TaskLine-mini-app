import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api, type ApiOptions } from '@/shared/api/http';
import { queryKeys } from '@/shared/api/query-keys';
import type { TicketPage } from '@/shared/types/api';
import type { IncidentDetail, IncidentList, IncidentSettings, IncidentStatus } from '@/shared/types/incidents';

export function useIncidentList(status: IncidentStatus | 'all', enabled = true) {
    return useQuery({
        queryKey: queryKeys.incidentList(status),
        queryFn: () => api<IncidentList>(`/v1/incidents${status === 'all' ? '' : `?status=${status}`}`),
        enabled,
        refetchInterval: 60000,
    });
}

export function useIncident(id: string | null) {
    return useQuery({
        queryKey: queryKeys.incident(id ?? ''),
        queryFn: () => api<IncidentDetail>(`/v1/incidents/${id ?? ''}`),
        enabled: id !== null,
    });
}

export function useIncidentTickets(id: string) {
    return useQuery({
        queryKey: [...queryKeys.tickets, 'incident', id],
        queryFn: () => api<TicketPage>(`/v1/tickets?incident=${id}&tab=all&sort=newest&limit=100`),
    });
}

export function useIncidentSettings(enabled: boolean) {
    return useQuery({
        queryKey: queryKeys.incidentSettings,
        queryFn: () => api<IncidentSettings>('/v1/incidents/settings'),
        enabled,
    });
}

export type IncidentRequest = { path: string } & ApiOptions;

export function useIncidentAction<T = unknown>(onDone?: (result: T) => void) {
    const cache = useQueryClient();

    return useMutation({
        mutationFn: ({ path, ...options }: IncidentRequest) => api<T>(path, { method: 'POST', ...options }),
        onSuccess: async (result) => {
            await Promise.all([
                cache.invalidateQueries({ queryKey: queryKeys.incidents }),
                cache.invalidateQueries({ queryKey: queryKeys.tickets }),
                cache.invalidateQueries({ queryKey: queryKeys.ticket }),
            ]);

            onDone?.(result);
        },
    });
}

export function useIncidentBadge(enabled: boolean) {
    const counts = useIncidentList('all', enabled).data?.counts;

    return counts ? { active: counts.suggested + counts.open, suggested: counts.suggested } : undefined;
}
