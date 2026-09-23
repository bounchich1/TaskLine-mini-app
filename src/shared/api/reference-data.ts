import { queryOptions } from '@tanstack/react-query';

import type { Dictionary, Employee } from '@/shared/types/api';

import { api } from './http';
import { queryKeys } from './query-keys';

/** Classification values (tags, urgency, complexity), including archived ones. */
export const dictionariesQuery = queryOptions({
  queryKey: queryKeys.dictionaries,
  queryFn: () => api<{ items: Dictionary[] }>('/v1/dictionaries'),
});

/** Colleagues, for assignee filters and transfers. */
export const employeesQuery = queryOptions({
  queryKey: queryKeys.employees,
  queryFn: () => api<{ items: Employee[] }>('/v1/employees'),
});
