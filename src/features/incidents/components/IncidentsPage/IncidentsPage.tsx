import { Button } from '@maxhub/max-ui';
import { clsx } from 'clsx';
import { useState } from 'react';

import { useIncidentList } from '@/features/incidents/hooks/use-incidents';
import { can } from '@/shared/lib/access';
import { useNow } from '@/shared/lib/use-now';
import type { Session } from '@/shared/types/api';
import type { IncidentDetail } from '@/shared/types/incidents';
import { ErrorNotice, Icon, PageHeader } from '@/shared/ui';

import { IncidentForm } from '../IncidentForm/IncidentForm';
import { IncidentSettingsDialog } from '../IncidentSettingsDialog/IncidentSettingsDialog';
import { IncidentsTab, type IncidentsTabName } from '../IncidentsTab/IncidentsTab';
import { IncidentView } from '../IncidentView/IncidentView';

import './IncidentsPage.scss';

const TABS: readonly { value: IncidentsTabName; label: string }[] = [
    { value: 'suggested', label: 'Подсказки' },
    { value: 'open', label: 'Идут' },
    { value: 'resolved', label: 'Решённые' },
];

type Creation = { suggestion: IncidentDetail | null } | null;

type IncidentsPageProps = {
    session: Session;
    selected: string | null;
    onSelect: (id: string | null) => void;
    onTicket: (id: string) => void;
};

export function IncidentsPage({ session, selected, onSelect, onTicket }: IncidentsPageProps) {
    const timezone = session.organization.timezone;
    const list = useIncidentList('all');
    const counts = list.data?.counts;
    const [chosen, setChosen] = useState<IncidentsTabName | null>(null);
    const [creation, setCreation] = useState<Creation>(null);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const now = useNow();
    const tab = chosen ?? (counts?.suggested ? 'suggested' : 'open');

    if (selected) {
        return (
            <IncidentView
                id={selected}
                session={session}
                onBack={() => {
                    onSelect(null);
                }}
                onTicket={onTicket}
            />
        );
    }

    const settings = can(session, 'organization.configure') ? (
        <button
            className="incidents-page__settings"
            aria-label="Настройки детектора"
            title="Настройки детектора"
            onClick={() => {
                setSettingsOpen(true);
            }}
        >
            <Icon name="settings" size={18} />
        </button>
    ) : null;

    return (
        <div className="incidents-page">
            <PageHeader
                title="Инциденты"
                actions={
                    <>
                        {settings}

                        <Button
                            size="small"
                            onClick={() => {
                                setCreation({ suggestion: null });
                            }}
                        >
                            Новый инцидент
                        </Button>
                    </>
                }
            />

            <div className="incidents-tabs" role="tablist" aria-label="Инциденты">
                {TABS.map((item) => (
                    <button
                        key={item.value}
                        role="tab"
                        aria-selected={tab === item.value}
                        className={clsx('incidents-tabs__tab', tab === item.value && 'incidents-tabs__tab--selected')}
                        onClick={() => {
                            setChosen(item.value);
                        }}
                    >
                        {item.label}
                        <span className="incidents-tabs__count">{counts?.[item.value] ?? '–'}</span>
                    </button>
                ))}
            </div>

            <ErrorNotice error={list.error} />

            <IncidentsTab
                tab={tab}
                label={TABS.find((item) => item.value === tab)?.label ?? ''}
                items={list.data?.items.filter((item) => item.status === tab)}
                timezone={timezone}
                now={now}
                onOpen={onSelect}
                onCreate={(suggestion) => {
                    setCreation({ suggestion });
                }}
            />

            {creation ? (
                <IncidentForm
                    suggestion={creation.suggestion}
                    timezone={timezone}
                    onClose={() => {
                        setCreation(null);
                    }}
                    onCreated={(id) => {
                        setCreation(null);
                        onSelect(id);
                    }}
                />
            ) : null}

            {settingsOpen ? (
                <IncidentSettingsDialog
                    onClose={() => {
                        setSettingsOpen(false);
                    }}
                />
            ) : null}
        </div>
    );
}
