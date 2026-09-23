import { useState } from 'react';

import { useAdminQueries } from '@/features/admin/hooks/use-admin-queries';
import { useAdminSave } from '@/features/admin/hooks/use-admin-save';
import {
  ADMIN_TABS,
  OPERATOR_TABS,
  type AdminDialog,
  type AdminTab,
} from '@/features/admin/model/types';
import type { Session } from '@/shared/types/api';
import { ErrorNotice, PageHeading } from '@/shared/ui';

import { AdminDialogs } from '../AdminDialogs/AdminDialogs';
import { AdminTabContent } from '../AdminTabContent/AdminTabContent';

type AdminPanelProps = {
  session: Session;
  onTicket: (id: string) => void;
};

/**
 * Team and settings for administrators; supervisors with operations access see only the
 * system state.
 */
export function AdminPanel({ session, onTicket }: AdminPanelProps) {
  const isAdmin = session.capabilities.admin;
  const [tab, setTab] = useState<AdminTab>(isAdmin ? 'employees' : 'diagnostics');
  const [dialog, setDialog] = useState<AdminDialog | null>(null);
  const { save, busy, error, setError } = useAdminSave(() => {
    setDialog(null);
  });
  const queries = useAdminQueries(tab, isAdmin);
  const queryError = Object.values(queries).find((query) => query.error)?.error;
  return (
    <>
      <PageHeading
        eyebrow="КОМАНДА И НАСТРОЙКИ"
        title="Управление"
        description="Доступ, правила обработки и состояние отправок."
      />
      <div className="admin-tabs" role="tablist" aria-label="Управление">
        {(isAdmin ? ADMIN_TABS : OPERATOR_TABS).map(([value, label]) => (
          <button
            role="tab"
            aria-selected={tab === value}
            className={tab === value ? 'selected' : ''}
            key={value}
            onClick={() => {
              setTab(value);
              setError(null);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <ErrorNotice error={error} />
      <ErrorNotice error={queryError} />
      <AdminTabContent
        tab={tab}
        queries={queries}
        busy={busy}
        save={save}
        timezone={session.organization.timezone}
        onTicket={onTicket}
        onOpen={setDialog}
      />
      {dialog ? (
        <AdminDialogs
          dialog={dialog}
          busy={busy}
          error={error}
          save={save}
          onClose={() => {
            setDialog(null);
          }}
        />
      ) : null}
    </>
  );
}
