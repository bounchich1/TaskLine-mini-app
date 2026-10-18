import { useQuery } from '@tanstack/react-query';

import { api } from '@/shared/api/http';
import { queryKeys } from '@/shared/api/query-keys';
import { dictionariesQuery } from '@/shared/api/reference-data';
import type { Employee, SlaConfig } from '@/shared/types/api';

import type {
    AdminTab,
    AuditEntry,
    BotSettings,
    BusinessProfile,
    Diagnostics,
    OrganizationSettings,
    Preset,
    ServerHealth,
    Template,
} from '../model/types';

const DIAGNOSTICS_REFETCH_MS = 15000;

export function useAdminQueries(tab: AdminTab, configure: boolean) {
    const employees = useQuery({
        queryKey: queryKeys.adminEmployees,
        queryFn: () => api<{ items: Employee[] }>('/v1/admin/employees'),
        enabled: tab === 'employees',
    });

    const dictionaries = useQuery({
        ...dictionariesQuery,
        enabled: tab === 'dictionaries' || tab === 'sla' || tab === 'assistant',
    });

    const templates = useQuery({
        queryKey: queryKeys.adminTemplates,
        queryFn: () => api<{ items: Template[] }>('/v1/admin/templates'),
        enabled: tab === 'templates',
    });

    const settings = useQuery({
        queryKey: queryKeys.adminSettings,
        queryFn: () => api<OrganizationSettings>('/v1/admin/settings'),
        enabled: tab === 'settings',
    });

    const profile = useQuery({
        queryKey: queryKeys.adminProfile,
        queryFn: () => api<BusinessProfile>('/v1/admin/profile'),
        enabled: configure,
    });

    const bot = useQuery({
        queryKey: queryKeys.adminBot,
        queryFn: () => api<BotSettings>('/v1/admin/bot'),
        enabled: tab === 'settings' || tab === 'templates',
    });

    const presets = useQuery({
        queryKey: queryKeys.adminPresets,
        queryFn: () => api<{ items: Preset[]; current: string | null }>('/v1/admin/presets'),
        enabled: tab === 'assistant',
    });

    const sla = useQuery({
        queryKey: queryKeys.adminSla,
        queryFn: () => api<SlaConfig>('/v1/admin/sla'),
        enabled: tab === 'sla',
    });

    const diagnostics = useQuery({
        queryKey: queryKeys.diagnostics,
        queryFn: () => api<Diagnostics>('/v1/admin/diagnostics'),
        enabled: tab === 'diagnostics',
        refetchInterval: DIAGNOSTICS_REFETCH_MS,
    });

    const health = useQuery({
        queryKey: queryKeys.health,
        queryFn: () => api<ServerHealth>('/health/live'),
        enabled: tab === 'diagnostics',
    });

    const audit = useQuery({
        queryKey: queryKeys.audit,
        queryFn: () => api<{ items: AuditEntry[] }>('/v1/admin/audit'),
        enabled: tab === 'audit',
    });

    return { employees, dictionaries, templates, profile, bot, presets, sla, settings, diagnostics, health, audit };
}

export type AdminQueries = ReturnType<typeof useAdminQueries>;
