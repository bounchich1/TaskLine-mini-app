import { can } from '@/shared/lib/access';
import type { Dictionary, Employee, Permission, Session } from '@/shared/types/api';

export type AdminTab = 'employees' | 'dictionaries' | 'templates' | 'settings' | 'diagnostics' | 'audit';

type AdminTabDefinition = { tab: AdminTab; label: string; permission: Permission };

const ADMIN_TABS: readonly AdminTabDefinition[] = [
    { tab: 'employees', label: 'Сотрудники', permission: 'employees.manage' },
    { tab: 'dictionaries', label: 'Справочники', permission: 'organization.configure' },
    { tab: 'templates', label: 'Шаблоны бота', permission: 'organization.configure' },
    { tab: 'settings', label: 'Организация', permission: 'organization.configure' },
    { tab: 'diagnostics', label: 'Состояние системы', permission: 'operations.view' },
    { tab: 'audit', label: 'Журнал', permission: 'audit.view' },
];

export function adminTabsFor(session: Pick<Session, 'permissions'>): readonly AdminTabDefinition[] {
    return ADMIN_TABS.filter(({ permission }) => can(session, permission));
}

export type ServerHealth = { status: string; version: string };

export type Template = { code: string; body: string; version: number };

export type OrganizationSettings = { name: string; timezone: string; version: number };

export type Diagnostic = {
    id: string;
    ticket_id?: string;
    message_id?: string;
    kind?: string;
    state: string;
    reason?: string;
    created_at?: string;
    eligible?: boolean;
};

export type DiagnosticKind = 'deliveries' | 'jobs' | 'memory';

type Permit = { slot: number; state: string };

export type Diagnostics = Record<DiagnosticKind, Diagnostic[]> & { permits: Permit[] };

export type AuditEntry = { id: string; action: string; object_id: string; created_at: string };

export type Resolution = { item: Diagnostic; action: 'cancel' | 'retry' };

export type AdminDialog =
    | { kind: 'employee'; employee: Employee | null }
    | { kind: 'block'; employee: Employee }
    | { kind: 'dictionary'; value: Dictionary | null }
    | { kind: 'template'; template: Template }
    | { kind: 'resolution'; resolution: Resolution };
