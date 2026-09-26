import { clsx } from 'clsx';
import { useState } from 'react';

import { useAdminQueries } from '@/features/admin/hooks/use-admin-queries';
import { useAdminSave } from '@/features/admin/hooks/use-admin-save';
import { adminTabsFor, type AdminDialog, type AdminTab } from '@/features/admin/model/types';
import type { Session } from '@/shared/types/api';
import { ErrorNotice, PageHeader } from '@/shared/ui';

import { AdminDialogs } from '../AdminDialogs/AdminDialogs';
import { AdminTabContent } from '../AdminTabContent/AdminTabContent';

import './AdminPanel.scss';

type AdminPanelProps = {
    session: Session;
    onTicket: (id: string) => void;
};

export function AdminPanel({ session, onTicket }: AdminPanelProps) {
    const tabs = adminTabsFor(session);
    const [tab, setTab] = useState<AdminTab>(tabs[0]?.tab ?? 'diagnostics');
    const [dialog, setDialog] = useState<AdminDialog | null>(null);

    const { save, busy, error, setError } = useAdminSave(() => {
        setDialog(null);
    });

    const queries = useAdminQueries(tab);
    const queryError = Object.values(queries).find((query) => query.error)?.error;

    return (
        <div className="admin-panel">
            <PageHeader title="Управление" />

            <div className="admin-tabs" role="tablist" aria-label="Управление">
                {tabs.map(({ tab: value, label }) => (
                    <button
                        role="tab"
                        aria-selected={tab === value}
                        className={clsx('admin-tabs__tab', tab === value && 'admin-tabs__tab--selected')}
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

            {dialog ? null : <ErrorNotice error={error} />}
            <ErrorNotice error={queryError} />

            <AdminTabContent
                tab={tab}
                session={session}
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
                    session={session}
                    busy={busy}
                    error={error}
                    save={save}
                    onClose={() => {
                        setDialog(null);
                    }}
                />
            ) : null}
        </div>
    );
}
