import { useIncidentAction } from '@/features/incidents/hooks/use-incidents';
import { can, canOnTicket } from '@/shared/lib/access';
import type { Session, Ticket } from '@/shared/types/api';
import { ErrorNotice, Icon } from '@/shared/ui';

import './IncidentBanner.scss';

const OPEN = new Set(['open', 'in_progress']);

type IncidentBannerProps = {
    ticket: Ticket;
    session: Session;
};

export function IncidentBanner({ ticket, session }: IncidentBannerProps) {
    const unlink = useIncidentAction();
    const incidentId = ticket.incident_id;

    if (!incidentId) {
        return null;
    }

    const active = ticket.incident_status === 'open';
    const allowed = can(session, 'incidents.manage') || canOnTicket(session, ticket, 'classify');

    return (
        <div className="incident-banner" role="note">
            <Icon name="zap" size={16} className="incident-banner__icon" />

            <span className="incident-banner__text">
                {active ? 'Инцидент' : 'Инцидент решён'}: {ticket.incident_title}
                {active ? (
                    <small className="incident-banner__hint">
                        Клиент получит общие сообщения инцидента; обращение закроется вместе с ним.
                    </small>
                ) : null}
            </span>

            {active && allowed && OPEN.has(ticket.status) ? (
                <button
                    className="incident-banner__action"
                    disabled={unlink.isPending}
                    onClick={() => {
                        unlink.mutate({ path: `/v1/incidents/${incidentId}/tickets/${ticket.id}`, method: 'DELETE' });
                    }}
                >
                    Отвязать
                </button>
            ) : null}

            <ErrorNotice error={unlink.error} className="incident-banner__error" />
        </div>
    );
}
