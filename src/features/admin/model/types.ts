import type { Dictionary, Employee } from '@/shared/types/api';

export type AdminTab =
  'employees' | 'dictionaries' | 'templates' | 'settings' | 'diagnostics' | 'audit';

export const ADMIN_TABS: readonly (readonly [AdminTab, string])[] = [
  ['employees', 'Сотрудники'],
  ['dictionaries', 'Справочники'],
  ['templates', 'Шаблоны бота'],
  ['settings', 'Организация'],
  ['diagnostics', 'Состояние системы'],
  ['audit', 'Журнал'],
];
export const OPERATOR_TABS: readonly (readonly [AdminTab, string])[] = [
  ['diagnostics', 'Состояние системы'],
];

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
  | { kind: 'dictionary'; value: Dictionary | null }
  | { kind: 'template'; template: Template }
  | { kind: 'resolution'; resolution: Resolution };
