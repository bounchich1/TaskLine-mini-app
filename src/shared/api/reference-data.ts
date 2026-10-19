import { queryOptions, useQuery } from '@tanstack/react-query';

import type { Dictionary, Employee } from '@/shared/types/api';
import type { Macro, Team } from '@/shared/types/routing';

import { api } from './http';
import { queryKeys } from './query-keys';

export const dictionariesQuery = queryOptions({
    queryKey: queryKeys.dictionaries,
    queryFn: () => api<{ items: Dictionary[] }>('/v1/dictionaries'),
});

export const employeesQuery = queryOptions({
    queryKey: queryKeys.employees,
    queryFn: () => api<{ items: Employee[] }>('/v1/employees'),
});

export const teamsQuery = queryOptions({
    queryKey: queryKeys.teams,
    queryFn: () => api<{ items: Team[] }>('/v1/teams'),
});

export const macrosQuery = queryOptions({
    queryKey: queryKeys.macros,
    queryFn: () => api<{ items: Macro[] }>('/v1/macros'),
});

const NO_TEAMS: Team[] = [];
const NO_MACROS: Macro[] = [];

export function useTeams(): Team[] {
    return useQuery(teamsQuery).data?.items ?? NO_TEAMS;
}

export function useMacros(): Macro[] {
    return useQuery(macrosQuery).data?.items ?? NO_MACROS;
}
