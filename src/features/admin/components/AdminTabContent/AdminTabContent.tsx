import type { ReactNode } from 'react';

import type { AdminQueries } from '@/features/admin/hooks/use-admin-queries';
import type { AdminSave } from '@/features/admin/hooks/use-admin-save';
import type { AdminDialog, AdminTab, Resolution } from '@/features/admin/model/types';
import { can } from '@/shared/lib/access';
import type { Session } from '@/shared/types/api';

import { AssistantTab } from '../tabs/AssistantTab/AssistantTab';
import { AuditTab } from '../tabs/AuditTab/AuditTab';
import { BotPolicyCard } from '../tabs/BotPolicyCard/BotPolicyCard';
import { DiagnosticsTab } from '../tabs/DiagnosticsTab/DiagnosticsTab';
import { DictionariesTab } from '../tabs/DictionariesTab/DictionariesTab';
import { EmployeesTab } from '../tabs/EmployeesTab/EmployeesTab';
import { MacrosTab } from '../tabs/MacrosTab/MacrosTab';
import { MenuLabelsCard } from '../tabs/MenuLabelsCard/MenuLabelsCard';
import { RoutingTab } from '../tabs/RoutingTab/RoutingTab';
import { SettingsTab } from '../tabs/SettingsTab/SettingsTab';
import { SlaTab } from '../tabs/SlaTab/SlaTab';
import { TeamsTab } from '../tabs/TeamsTab/TeamsTab';
import { TemplatesTab } from '../tabs/TemplatesTab/TemplatesTab';

type AdminTabContentProps = {
    tab: AdminTab;
    session: Session;
    queries: AdminQueries;
    busy: boolean;
    save: AdminSave;
    timezone: string;
    onTicket: (id: string) => void;
    onOpen: (dialog: AdminDialog) => void;
};

function diagnosticActions({ session, save, onOpen }: AdminTabContentProps) {
    const onResolve = (resolution: Resolution) => {
        onOpen({ kind: 'resolution', resolution });
    };

    const onRetryJob = (id: string) => {
        void save(`/v1/admin/jobs/${id}/retry`, { method: 'POST', body: {} });
    };

    return {
        onResolve: can(session, 'deliveries.resolve_unknown') ? onResolve : undefined,
        onRetryJob: can(session, 'operations.retry') ? onRetryJob : undefined,
    };
}

function settingsTab({ queries, busy, save }: AdminTabContentProps) {
    return (
        <>
            {queries.settings.data ? <SettingsTab settings={queries.settings.data} busy={busy} save={save} /> : null}
            {queries.bot.data ? <BotPolicyCard bot={queries.bot.data} busy={busy} save={save} /> : null}
        </>
    );
}

function templatesTab({ queries, busy, save, onOpen }: AdminTabContentProps) {
    return (
        <>
            <TemplatesTab
                templates={queries.templates.data?.items}
                onEdit={(template) => {
                    onOpen({ kind: 'template', template });
                }}
            />

            {queries.bot.data ? <MenuLabelsCard bot={queries.bot.data} busy={busy} save={save} /> : null}
        </>
    );
}

function assistantTab({ queries, busy, save, onOpen }: AdminTabContentProps) {
    const profile = queries.profile.data;

    return profile ? (
        <AssistantTab
            profile={profile}
            presets={queries.presets.data?.items}
            dictionaries={queries.dictionaries.data?.items}
            busy={busy}
            save={save}
            onPreset={() => {
                onOpen({ kind: 'preset', profile });
            }}
            onSetup={() => {
                onOpen({ kind: 'setup', profile });
            }}
        />
    ) : null;
}

function slaTab({ queries, busy, save }: AdminTabContentProps) {
    const config = queries.sla.data;
    const dictionaries = queries.dictionaries.data?.items;

    return config && dictionaries ? (
        <SlaTab key={config.version} config={config} dictionaries={dictionaries} busy={busy} save={save} />
    ) : null;
}

function routingTab({ queries, busy, save }: AdminTabContentProps) {
    const rules = queries.rules.data;
    const teams = queries.teams.data?.items;
    const dictionaries = queries.dictionaries.data?.items;

    return rules && teams && dictionaries ? (
        <RoutingTab
            key={rules.version}
            rules={rules}
            teams={teams}
            dictionaries={dictionaries}
            busy={busy}
            save={save}
        />
    ) : null;
}

function teamsTab({ queries, onOpen }: AdminTabContentProps) {
    return (
        <TeamsTab
            teams={queries.teams.data?.items}
            onEdit={(team) => {
                onOpen({ kind: 'team', team });
            }}
        />
    );
}

function macrosTab({ queries, onOpen }: AdminTabContentProps) {
    return (
        <MacrosTab
            macros={queries.macros.data?.items}
            dictionaries={queries.dictionaries.data?.items}
            onEdit={(macro) => {
                onOpen({ kind: 'macro', macro });
            }}
        />
    );
}

function employeesTab({ queries, session, busy, save, onOpen }: AdminTabContentProps) {
    return (
        <EmployeesTab
            employees={queries.employees.data?.items}
            session={session}
            busy={busy}
            onEdit={(employee) => {
                onOpen({ kind: 'employee', employee });
            }}
            onBlock={(employee) => {
                onOpen({ kind: 'block', employee });
            }}
            onUnblock={(employee) => {
                void save(`/v1/admin/employees/${employee.id}`, {
                    method: 'PATCH',
                    body: { blocked: false },
                    version: employee.version,
                });
            }}
        />
    );
}

function dictionariesTab({ queries, onOpen }: AdminTabContentProps) {
    return (
        <DictionariesTab
            items={queries.dictionaries.data?.items}
            onEdit={(value) => {
                onOpen({ kind: 'dictionary', value });
            }}
        />
    );
}

function diagnosticsTab(props: AdminTabContentProps) {
    return (
        <DiagnosticsTab
            diagnostics={props.queries.diagnostics.data}
            server={props.queries.health.data}
            busy={props.busy}
            onTicket={props.onTicket}
            {...diagnosticActions(props)}
        />
    );
}

function auditTab({ queries, timezone }: AdminTabContentProps) {
    return <AuditTab items={queries.audit.data?.items} timezone={timezone} />;
}

const RENDERERS: Record<AdminTab, (props: AdminTabContentProps) => ReactNode> = {
    employees: employeesTab,
    teams: teamsTab,
    routing: routingTab,
    macros: macrosTab,
    dictionaries: dictionariesTab,
    assistant: assistantTab,
    templates: templatesTab,
    sla: slaTab,
    settings: settingsTab,
    diagnostics: diagnosticsTab,
    audit: auditTab,
};

export function AdminTabContent(props: AdminTabContentProps) {
    return RENDERERS[props.tab](props);
}
