import type { QueueTab } from '@/features/ticket-queue/model/filter-defaults';
import type { Ticket } from '@/shared/types/api';

import { TicketListItem } from '../TicketListItem/TicketListItem';

type TicketListProps = {
  rows: Ticket[];
  tab: QueueTab;
  timezone: string;
  expanded: string | null;
  onToggle: (id: string) => void;
};

export function TicketList({ rows, tab, timezone, expanded, onToggle }: TicketListProps) {
  return (
    <ul aria-label="Обращения">
      {rows.map((ticket) => (
        <TicketListItem
          key={ticket.id}
          ticket={ticket}
          selected={expanded === ticket.id}
          withRating={tab === 'closed'}
          timezone={timezone}
          onToggle={onToggle}
        />
      ))}
    </ul>
  );
}
