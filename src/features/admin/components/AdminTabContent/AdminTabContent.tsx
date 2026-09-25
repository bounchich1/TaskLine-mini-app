import type { AdminQueries } from '@/features/admin/hooks/use-admin-queries';
import type { AdminSave } from '@/features/admin/hooks/use-admin-save';
import type { AdminDialog, AdminTab } from '@/features/admin/model/types';

import { AuditTab } from '../tabs/AuditTab/AuditTab';
import { DiagnosticsTab } from '../tabs/DiagnosticsTab/DiagnosticsTab';
import { DictionariesTab } from '../tabs/DictionariesTab/DictionariesTab';
import { EmployeesTab } from '../tabs/EmployeesTab/EmployeesTab';
import { SettingsTab } from '../tabs/SettingsTab/SettingsTab';
import { TemplatesTab } from '../tabs/TemplatesTab/TemplatesTab';

type AdminTabContentProps = {
  tab: AdminTab;
  queries: AdminQueries;
  busy: boolean;
  save: AdminSave;
  timezone: string;
  onTicket: (id: string) => void;
  onOpen: (dialog: AdminDialog) => void;
};

export function AdminTabContent(props: AdminTabContentProps) {
  const { queries, busy, save, onOpen } = props;
  switch (props.tab) {
    case 'employees':
      return (
        <EmployeesTab
          employees={queries.employees.data?.items}
          onEdit={(employee) => {
            onOpen({ kind: 'employee', employee });
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
          busy={busy}
          onTicket={props.onTicket}
          onResolve={(resolution) => {
            onOpen({ kind: 'resolution', resolution });
          }}
          onRetryJob={(id) => {
            void save(`/v1/admin/jobs/${id}/retry`, { method: 'POST', body: {} });
          }}
        />
      );
    case 'audit':
      return <AuditTab items={queries.audit.data?.items} timezone={props.timezone} />;
  }
}
