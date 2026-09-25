import type { ColumnDef } from '@tanstack/react-table';
import { clsx } from 'clsx';

import { formatDate } from '@/shared/lib/format-date';
import type { Ticket } from '@/shared/types/api';
import { Avatar, Status, Urgency } from '@/shared/ui';

import type { QueueTab } from './filter-defaults';
import { complexityText, isClassifying, ratingText, tagText, urgencyText } from './ticket-fields';

type ColumnOptions = {
  expanded: string | null;
  onToggle: (id: string) => void;
  tab: QueueTab;
  timezone: string;
};

const muted = (ticket: Ticket) => isClassifying(ticket) && 'ticket-table__muted';

const ratingColumn: ColumnDef<Ticket> = {
  id: 'rating',
  header: 'Оценка',
  cell: ({ row: { original: ticket } }) => (
    <span className={clsx(!ticket.rating && 'ticket-table__muted')}>{ratingText(ticket)}</span>
  ),
};

export function buildTicketColumns({ expanded, onToggle, tab, timezone }: ColumnOptions) {
  const columns: ColumnDef<Ticket>[] = [
    {
      id: 'number',
      header: 'Обращение',
      cell: ({ row: { original: ticket } }) => (
        <div className="ticket-table__subject">
          <button
            className="ticket-table__number"
            onClick={() => {
              onToggle(ticket.id);
            }}
            aria-expanded={expanded === ticket.id}
          >
            №{ticket.number}
          </button>
          <span className="ticket-table__preview">{ticket.description}</span>
        </div>
      ),
    },
    {
      id: 'tag',
      header: 'Тег',
      cell: ({ row: { original: ticket } }) => (
        <span className="ticket-table__tag">
          <span className={clsx(muted(ticket))}>{tagText(ticket)}</span>
          {ticket.review_required ? <span className="ticket-table__review">Проверить</span> : null}
        </span>
      ),
    },
    {
      id: 'urgency',
      header: 'Срочность',
      cell: ({ row: { original: ticket } }) => (
        <Urgency code={isClassifying(ticket) ? '' : ticket.urgency} label={urgencyText(ticket)} />
      ),
    },
    {
      id: 'complexity',
      header: 'Сложность',
      cell: ({ row: { original: ticket } }) => (
        <span className={clsx(muted(ticket))}>{complexityText(ticket)}</span>
      ),
    },
    { id: 'status', header: 'Статус', cell: ({ row }) => <Status status={row.original.status} /> },
    {
      id: 'created',
      header: 'Создано',
      cell: ({ row: { original: ticket } }) => (
        <time className="ticket-table__date" dateTime={ticket.created_at}>
          {formatDate(ticket.created_at, timezone)}
        </time>
      ),
    },
    {
      id: 'assignee',
      header: 'Исполнитель',
      cell: ({ row: { original: ticket } }) =>
        ticket.assignee_name ? (
          <span className="ticket-table__assignee">
            <Avatar name={ticket.assignee_name} size={20} />
            <span className="ticket-table__assignee-name">{ticket.assignee_name}</span>
          </span>
        ) : (
          <span className="ticket-table__muted">Не назначен</span>
        ),
    },
  ];
  return tab === 'closed' ? [...columns, ratingColumn] : columns;
}
