import type { Dictionary, Employee } from '@/shared/types/api';

export type AdminTab =
  'employees' | 'dictionaries' | 'templates' | 'settings' | 'diagnostics' | 'audit';

/** Tabs of an administrator, and of a supervisor with operations access only. */
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

/** A bot message template. */
export type Template = { code: string; body: string; version: number };

export type OrganizationSettings = { name: string; timezone: string; version: number };

/** A delivery, background job or memory write that has not finished normally. */
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

/** An AI call slot. */
type Permit = { slot: number; state: string };

export type Diagnostics = Record<DiagnosticKind, Diagnostic[]> & { permits: Permit[] };

export type AuditEntry = { id: string; action: string; object_id: string; created_at: string };

/** A supervisor's decision on a delivery whose outcome is unknown. */
export type Resolution = { item: Diagnostic; action: 'cancel' | 'retry' };

/** The open admin dialog; `null` in `employee`/`value` means adding a new item. */
export type AdminDialog =
  | { kind: 'employee'; employee: Employee | null }
  | { kind: 'dictionary'; value: Dictionary | null }
  | { kind: 'template'; template: Template }
  | { kind: 'resolution'; resolution: Resolution };
