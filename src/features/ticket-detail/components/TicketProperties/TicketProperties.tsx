import type { ReactNode } from 'react';

import type { Ticket } from '@/shared/types/api';
import { Avatar, Icon } from '@/shared/ui';

import './TicketProperties.scss';

/** Assignee, classification and actions of the ticket. */
export function TicketProperties({ ticket, children }: { ticket: Ticket; children: ReactNode }) {
  return (
    <div className="ticket-details">
      <span className="ticket-details__label">ДЕТАЛИ И ДЕЙСТВИЯ</span>
      <div className="ticket-details__assignee">
        <Avatar size="small">
          <Icon name="user" size={16} />
        </Avatar>
        <div>
          <small className="ticket-details__assignee-caption">Исполнитель</small>
          <strong className="ticket-details__assignee-name">
            {ticket.assignee_name ?? 'Не назначен'}
          </strong>
        </div>
      </div>
      {children}
    </div>
  );
}
