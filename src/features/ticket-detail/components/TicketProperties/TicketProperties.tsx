import type { ReactNode } from 'react';

import type { Ticket } from '@/shared/types/api';
import { Avatar, Icon } from '@/shared/ui';

/** Assignee, classification and actions of the ticket. */
export function TicketProperties({ ticket, children }: { ticket: Ticket; children: ReactNode }) {
  return (
    <div className="property-box">
      <span className="section-label">ДЕТАЛИ И ДЕЙСТВИЯ</span>
      <div className="assigned-to">
        <Avatar size="small">
          <Icon name="user" size={16} />
        </Avatar>
        <div>
          <small>Исполнитель</small>
          <strong>{ticket.assignee_name ?? 'Не назначен'}</strong>
        </div>
      </div>
      {children}
    </div>
  );
}
