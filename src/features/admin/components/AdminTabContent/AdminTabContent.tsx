import type { AdminQueries } from '@/features/admin/hooks/use-admin-queries';
import type { AdminSave } from '@/features/admin/hooks/use-admin-save';
import type { AdminDialog, AdminTab, Resolution } from '@/features/admin/model/types';
import { can } from '@/shared/lib/access';
import type { Session } from '@/shared/types/api';

import { AuditTab } from '../tabs/AuditTab/AuditTab';
import { DiagnosticsTab } from '../tabs/DiagnosticsTab/DiagnosticsTab';
import { DictionariesTab } from '../tabs/DictionariesTab/DictionariesTab';
import { EmployeesTab } from '../tabs/EmployeesTab/EmployeesTab';
import { SettingsTab } from '../tabs/SettingsTab/SettingsTab';
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

export function AdminTabContent(props: AdminTabContentProps) {
    const { queries, session, busy, save, onOpen } = props;

    switch (props.tab) {
        case 'employees':
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
        case 'dictionaries':
            return (
                <DictionariesTab
                    items={queries.dictionaries.data?.items}
                    onEdit={(value) => {
                        onOpen({ kind: 'dictionary', value });
                    }}
                />
            );
        case 'templates':
            return (
                <TemplatesTab
                    templates={queries.templates.data?.items}
                    onEdit={(template) => {
                        onOpen({ kind: 'template', template });
                    }}
                />
            );
        case 'settings':
            return queries.settings.data ? (
                <SettingsTab settings={queries.settings.data} busy={busy} save={save} />
            ) : null;
        case 'diagnostics':
            return (
                <DiagnosticsTab
                    diagnostics={queries.diagnostics.data}
                    server={queries.health.data}
                    busy={busy}
                    onTicket={props.onTicket}
                    {...diagnosticActions(props)}
                />
            );
        case 'audit':
            return <AuditTab items={queries.audit.data?.items} timezone={props.timezone} />;
    }
}
