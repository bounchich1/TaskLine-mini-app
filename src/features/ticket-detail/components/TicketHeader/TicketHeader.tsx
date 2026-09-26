import type { ReactNode } from 'react';

import type { TicketRef } from '@/features/ticket-detail/model/navigation';
import { MEDIA, useMediaQuery } from '@/shared/lib/use-media-query';
import type { Ticket } from '@/shared/types/api';
import { Icon, Status } from '@/shared/ui';

import './TicketHeader.scss';

type TicketHeaderProps = {
    ticket: Ticket;
    returnTo: TicketRef | null;
    onReturn: () => void;
    onClose: () => void;
    children: ReactNode;
};

export function TicketHeader({ ticket, returnTo, onReturn, onClose, children }: TicketHeaderProps) {
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
            <div className="ticket-header__actions">{children}</div>
            {split ? close : null}
        </div>
    );
}
