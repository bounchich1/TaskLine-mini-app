import { clsx } from 'clsx';
import { useState } from 'react';

import { useIncident } from '@/features/incidents/hooks/use-incidents';
import { formatEta, incidentStatusLabel } from '@/features/incidents/model/format';
import { formatDate } from '@/shared/lib/format-date';
import type { Session } from '@/shared/types/api';
import { ErrorNotice, Icon } from '@/shared/ui';

import { IncidentActions, type IncidentDialog } from '../IncidentActions/IncidentActions';
import { IncidentDialogs } from '../IncidentDialogs/IncidentDialogs';
import { IncidentTickets } from '../IncidentTickets/IncidentTickets';
import { IncidentTimeline } from '../IncidentTimeline/IncidentTimeline';

import './IncidentView.scss';

type IncidentViewProps = {
    id: string;
    session: Session;
    onBack: () => void;
    onTicket: (id: string) => void;
};

export function IncidentView({ id, session, onBack, onTicket }: IncidentViewProps) {
    const detail = useIncident(id);
    const [dialog, setDialog] = useState<IncidentDialog | null>(null);
    const timezone = session.organization.timezone;
    const incident = detail.data;

    return (
        <div className="incident-view">
            <button className="incident-view__back" onClick={onBack}>
                <Icon name="back" size={14} />
                Все инциденты
            </button>

            <ErrorNotice error={detail.error} />

            {incident ? (
                <>
                    <div className="incident-view__head">
                        <h1 className="incident-view__title">{incident.title}</h1>

                        <span className={clsx('incident-view__status', `incident-view__status--${incident.status}`)}>
                            {incidentStatusLabel(incident.status)}
                        </span>
                    </div>

                    <p className="incident-view__meta">
                        {incident.tag_label} · создан {formatDate(incident.opened_at ?? incident.created_at, timezone)}
                        {incident.created_by_name ? ` · ${incident.created_by_name}` : ''}
                    </p>

                    <dl className="incident-view__stats">
                        <div>
                            <dt>Связано</dt>
                            <dd>{incident.linked}</dd>
                        </div>

                        <div>
                            <dt>Ещё открыто</dt>
                            <dd>{incident.linked_open}</dd>
                        </div>

                        <div>
                            <dt>Привязал бот</dt>
                            <dd>{incident.linked_auto}</dd>
                        </div>

                        <div>
                            <dt>Сообщений отправлено</dt>
                            <dd>{incident.messages_sent}</dd>
                        </div>

                        <div>
                            <dt>Срок</dt>
                            <dd>{formatEta(incident.eta, timezone)}</dd>
                        </div>
                    </dl>

                    <IncidentActions incident={incident} onDialog={setDialog} />

                    <section className="incident-view__section" aria-label="Сообщение для клиентов">
                        <h2 className="incident-view__section-title">Сообщение для клиентов</h2>
                        <p className="incident-view__message">{incident.public_message || 'Не задано.'}</p>

                        <p className="incident-view__terms">
                            Автопривязка по словам:{' '}
                            {incident.match_terms.length ? incident.match_terms.join(', ') : 'не задана'}
                        </p>
                    </section>

                    <IncidentTickets incident={incident} timezone={timezone} onTicket={onTicket} />
                    <IncidentTimeline updates={incident.updates} timezone={timezone} />

                    <IncidentDialogs
                        incident={incident}
                        dialog={dialog}
                        timezone={timezone}
                        onClose={() => {
                            setDialog(null);
                        }}
                    />
                </>
            ) : null}

            {detail.isPending ? <p className="incident-view__loading">Загружаем инцидент…</p> : null}
        </div>
    );
}
