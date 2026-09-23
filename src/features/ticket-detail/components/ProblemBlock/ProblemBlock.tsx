import { formatDate } from '@/shared/lib/format-date';
import type { Ticket } from '@/shared/types/api';
import { Icon } from '@/shared/ui';

/** The client's first message and when the ticket was created and taken. */
export function ProblemBlock({ ticket, timezone }: { ticket: Ticket; timezone: string }) {
  return (
    <div className="problem">
      <span className="section-label">ПРОБЛЕМА КЛИЕНТА</span>
      <p>{ticket.description}</p>
      <div className="meta-line">
        <Icon name="clock" size={14} />
        Создано {formatDate(ticket.created_at, timezone)}
        {ticket.taken_at ? <> · Взято {formatDate(ticket.taken_at, timezone)}</> : null}
      </div>
    </div>
  );
}
