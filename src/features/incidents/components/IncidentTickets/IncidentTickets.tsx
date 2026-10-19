import { useIncidentAction, useIncidentTickets } from '@/features/incidents/hooks/use-incidents';
import { formatDate } from '@/shared/lib/format-date';
import type { Incident } from '@/shared/types/incidents';
import { ErrorNotice, Status } from '@/shared/ui';

import './IncidentTickets.scss';

const OPEN = new Set(['open', 'in_progress']);

type IncidentTicketsProps = {
    incident: Incident;
    timezone: string;
    onTicket: (id: string) => void;
};

export function IncidentTickets({ incident, timezone, onTicket }: IncidentTicketsProps) {
    const tickets = useIncidentTickets(incident.id);
    const unlink = useIncidentAction();
    const rows = tickets.data?.items ?? [];
    const editable = incident.status === 'open';

    return (
        <section className="incident-tickets" aria-label="Связанные обращения">
            <h2 className="incident-tickets__title">Связанные обращения · {incident.linked}</h2>
            <ErrorNotice error={tickets.error ?? unlink.error} />

            {rows.length ? (
                <ul className="incident-tickets__list">
                    {rows.map((ticket) => (
                        <li key={ticket.id} className="incident-tickets__row">
                            <button
                                className="incident-tickets__open"
                                onClick={() => {
                                    onTicket(ticket.id);
                                }}
                            >
                                <span className="incident-tickets__number">№{ticket.number}</span>
                                <span className="incident-tickets__text">{ticket.description}</span>

                                <span className="incident-tickets__date">
                                    {formatDate(ticket.created_at, timezone)}
                                </span>
                            </button>

                            <Status status={ticket.status} className="incident-tickets__status" />

                            {editable && OPEN.has(ticket.status) ? (
                                <button
                                    className="incident-tickets__unlink"
                                    disabled={unlink.isPending}
                                    aria-label={`Отвязать обращение №${ticket.number}`}
                                    onClick={() => {
                                        unlink.mutate({
                                            path: `/v1/incidents/${incident.id}/tickets/${ticket.id}`,
                                            method: 'DELETE',
                                        });
                                    }}
                                >
                                    Отвязать
                                </button>
                            ) : null}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="incident-tickets__empty">
                    {tickets.isPending
                        ? 'Загружаем…'
                        : 'Пока нет. Свяжите обращения из очереди или включите автопривязку.'}
                </p>
            )}
        </section>
    );
}
