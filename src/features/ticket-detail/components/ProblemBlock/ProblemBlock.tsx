import { formatDate } from '@/shared/lib/format-date';
import type { Ticket } from '@/shared/types/api';
import { Icon } from '@/shared/ui';

import './ProblemBlock.scss';

/** The client's first message and when the ticket was created and taken. */
export function ProblemBlock({ ticket, timezone }: { ticket: Ticket; timezone: string }) {
  return (
    <div className="problem">
      <span className="problem__label">ПРОБЛЕМА КЛИЕНТА</span>
      <p className="problem__text">{ticket.description}</p>
      <div className="problem__meta">
        <Icon name="clock" size={14} />
        Создано {formatDate(ticket.created_at, timezone)}
        {ticket.taken_at ? <> · Взято {formatDate(ticket.taken_at, timezone)}</> : null}
      </div>
    </div>
  );
}
