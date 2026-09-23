import { useQuery } from '@tanstack/react-query';

import { api } from '@/shared/api/http';
import { queryKeys } from '@/shared/api/query-keys';
import { dictionariesQuery } from '@/shared/api/reference-data';
import type { Employee } from '@/shared/types/api';

import type {
  AdminTab,
  AuditEntry,
  Diagnostics,
  OrganizationSettings,
  Template,
} from '../model/types';

const DIAGNOSTICS_REFETCH_MS = 15000;

/** The data of each admin tab, fetched only while its tab is open. */
export function useAdminQueries(tab: AdminTab, isAdmin: boolean) {
  const employees = useQuery({
    queryKey: queryKeys.adminEmployees,
    queryFn: () => api<{ items: Employee[] }>('/v1/admin/employees'),
    enabled: isAdmin && tab === 'employees',
  });
  const dictionaries = useQuery({ ...dictionariesQuery, enabled: tab === 'dictionaries' });
  const templates = useQuery({
    queryKey: queryKeys.adminTemplates,
    queryFn: () => api<{ items: Template[] }>('/v1/admin/templates'),
    enabled: isAdmin && tab === 'templates',
  });
  const settings = useQuery({
    queryKey: queryKeys.adminSettings,
    queryFn: () => api<OrganizationSettings>('/v1/admin/settings'),
    enabled: isAdmin && tab === 'settings',
  });
  const diagnostics = useQuery({
    queryKey: queryKeys.diagnostics,
    queryFn: () => api<Diagnostics>('/v1/admin/diagnostics'),
    enabled: tab === 'diagnostics',
    refetchInterval: DIAGNOSTICS_REFETCH_MS,
  });
  const audit = useQuery({
    queryKey: queryKeys.audit,
    queryFn: () => api<{ items: AuditEntry[] }>('/v1/admin/audit'),
    enabled: isAdmin && tab === 'audit',
  });
  return { employees, dictionaries, templates, settings, diagnostics, audit };
}

export type AdminQueries = ReturnType<typeof useAdminQueries>;
