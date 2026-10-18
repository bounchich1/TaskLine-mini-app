import { can } from '@/shared/lib/access';
import type { Dictionary, Employee, Permission, Session } from '@/shared/types/api';

export type AdminTab =
    'employees' | 'assistant' | 'dictionaries' | 'templates' | 'sla' | 'settings' | 'diagnostics' | 'audit';

type AdminTabDefinition = { tab: AdminTab; label: string; permission: Permission };

const ADMIN_TABS: readonly AdminTabDefinition[] = [
    { tab: 'employees', label: 'Сотрудники', permission: 'employees.manage' },
    { tab: 'assistant', label: 'ИИ-помощник', permission: 'organization.configure' },
    { tab: 'dictionaries', label: 'Темы и уровни', permission: 'organization.configure' },
    { tab: 'templates', label: 'Диалог с клиентом', permission: 'organization.configure' },
    { tab: 'sla', label: 'SLA', permission: 'organization.configure' },
    { tab: 'settings', label: 'Организация', permission: 'organization.configure' },
    { tab: 'diagnostics', label: 'Состояние системы', permission: 'operations.view' },
    { tab: 'audit', label: 'Журнал', permission: 'audit.view' },
];

export function adminTabsFor(session: Pick<Session, 'permissions'>): readonly AdminTabDefinition[] {
    return ADMIN_TABS.filter(({ permission }) => can(session, permission));
}

export type ServerHealth = { status: string; version: string };

export type Template = { code: string; body: string; default_body: string | null; version: number };

export type Tone = 'formal' | 'friendly';

export type GlossaryEntry = { term: string; meaning: string };

export type BusinessProfile = {
    preset: string | null;
    description: string;
    offerings: string;
    tone: Tone;
    rules: string[];
    glossary: GlossaryEntry[];
    configured: boolean;
    version: number;
};

export type MenuLabels = { tickets: string; help: string; withdraw: string };

export type BotSettings = {
    policy_url: string;
    policy_version: string;
    policy_version_source: 'deployment' | 'organization';
    alternative_contact: string;
    menu: MenuLabels;
    default_menu: MenuLabels;
    version: number;
};

export type Preset = { id: string; title: string; summary: string; topics: string[] };

export type PresetPreview = {
    id: string;
    title: string;
    add: string[];
    update: string[];
    deactivate: string[];
    levels_described: boolean;
};

type Retention = { closed_ticket_days: number | null; audit_days: number | null };

export type OrganizationSettings = { name: string; timezone: string; version: number; retention: Retention };

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
    | { kind: 'preset'; profile: BusinessProfile }
    | { kind: 'setup'; profile: BusinessProfile }
    | { kind: 'resolution'; resolution: Resolution };
