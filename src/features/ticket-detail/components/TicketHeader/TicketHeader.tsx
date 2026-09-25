import type { ReactNode } from 'react';

import { MEDIA, useMediaQuery } from '@/shared/lib/use-media-query';
import type { Ticket } from '@/shared/types/api';
import { Icon, Status } from '@/shared/ui';

import './TicketHeader.scss';

type TicketHeaderProps = {
  ticket: Ticket;
  onClose: () => void;
  /** The ticket's actions. */
  children: ReactNode;
};

/**
 * Number, status and actions. Beside the queue the card closes with ✕ on the right; on narrow
 * screens it replaces the queue, so it goes back with an arrow on the left.
 */
export function TicketHeader({ ticket, onClose, children }: TicketHeaderProps) {
  const split = useMediaQuery(MEDIA.desktop);
  const close = (
    <button className="ticket-header__close" aria-label="Свернуть обращение" onClick={onClose}>
      <Icon name={split ? 'close' : 'back'} size={20} />
    </button>
  );
  return (
    <div className="ticket-header">
      {split ? null : close}
      <h2 className="ticket-header__title">№{ticket.number}</h2>
      <Status className="ticket-header__status" status={ticket.status} />
      <div className="ticket-header__actions">{children}</div>
      {split ? close : null}
    </div>
  );
}
