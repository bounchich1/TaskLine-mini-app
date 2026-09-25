import { queryOptions } from '@tanstack/react-query';

import type { Dictionary, Employee } from '@/shared/types/api';

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
