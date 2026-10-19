import type { ReactNode } from 'react';

import type { TicketRef } from '@/features/ticket-detail/model/navigation';
import { MEDIA, useMediaQuery } from '@/shared/lib/use-media-query';
import type { Ticket } from '@/shared/types/api';
import { Icon, SlaChip, Status } from '@/shared/ui';

import { ViewersLine } from '../ViewersLine/ViewersLine';

import './TicketHeader.scss';

type TicketHeaderProps = {
    ticket: Ticket;
    timezone: string;
    me: string;
    returnTo: TicketRef | null;
    onReturn: () => void;
    onClose: () => void;
    children: ReactNode;
};

function offerLabel(ticket: Ticket, me: string): string | null {
    if (ticket.status !== 'open' || !ticket.offered_to) {
        return null;
    }

    return ticket.offered_to === me ? 'Предложено вам' : `Предложено: ${ticket.offered_to_name ?? 'сотруднику'}`;
}

export function TicketHeader(props: TicketHeaderProps) {
    const { ticket, timezone, me, returnTo, onReturn, onClose, children } = props;
    const offer = offerLabel(ticket, me);
    const split = useMediaQuery(MEDIA.desktop);

    const close = (
        <button className="ticket-header__close" aria-label="Свернуть обращение" onClick={onClose}>
            <Icon name={split ? 'close' : 'back'} size={20} />
        </button>
    );

    return (
        <div className="ticket-header">
            {split ? null : close}

            {returnTo ? (
                <button className="ticket-header__return" onClick={onReturn}>
                    <Icon name="back" size={14} />к №{returnTo.number}
                </button>
            ) : null}

            <h2 className="ticket-header__title">№{ticket.number}</h2>
            <Status className="ticket-header__status" status={ticket.status} />
            <SlaChip ticket={ticket} timezone={timezone} />
            {offer ? <span className="ticket-header__offer">{offer}</span> : null}
            <div className="ticket-header__actions">{children}</div>
            {split ? close : null}
            <ViewersLine ticketId={ticket.id} me={me} />
        </div>
    );
}
