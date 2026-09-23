import type { ColumnDef } from '@tanstack/react-table';
import { clsx } from 'clsx';
import type { Dispatch, SetStateAction } from 'react';

import { formatDate } from '@/shared/lib/format-date';
import type { Ticket } from '@/shared/types/api';
import { Avatar, Badge, Icon } from '@/shared/ui';

import type { QueueTab } from './filter-defaults';

type ColumnOptions = {
  expanded: string | null;
  onExpand: Dispatch<SetStateAction<string | null>>;
  tab: QueueTab;
  timezone: string;
};

/** While the assistant classifies a new ticket its labels are not known yet. */
const classifying = (ticket: Ticket) => ticket.ai_status === 'pending';

function ratingLabel(ticket: Ticket) {
  if (ticket.rating) {
    return `${ticket.rating} / 10`;
  }
  return ticket.status === 'awaiting_rating' ? 'Ожидается' : 'Без оценки';
}

const ratingColumn: ColumnDef<Ticket> = {
  id: 'rating',
  header: 'Оценка',
  cell: ({ row }) => <span>{ratingLabel(row.original)}</span>,
};

/** Queue columns; the number cell expands the ticket. Closed tickets also show the rating. */
export function buildTicketColumns({ expanded, onExpand, tab, timezone }: ColumnOptions) {
  const columns: ColumnDef<Ticket>[] = [
    {
      id: 'number',
      header: 'Обращение',
      cell: ({ row: { original: ticket } }) => (
        <button
          className="ticket-table__link"
          onClick={() => {
            onExpand((id) => (id === ticket.id ? null : ticket.id));
          }}
          aria-expanded={expanded === ticket.id}
        >
          <span
            className={clsx(
              'ticket-table__arrow',
              expanded === ticket.id && 'ticket-table__arrow--open',
            )}
          >
            <Icon name="arrow" size={15} />
          </span>
          <span>
            №{ticket.number}
            <small className="ticket-table__link-meta">
              {classifying(ticket) ? 'Определяется…' : ticket.tag_label}
              {ticket.review_required ? ' · Проверить' : null}
            </small>
          </span>
        </button>
      ),
    },
    {
      id: 'urgency',
      header: 'Срочность',
      cell: ({ row: { original: ticket } }) => (
        <span className={`ticket-table__urgency ticket-table__urgency--${ticket.urgency}`}>
          {classifying(ticket) ? 'Определяется' : ticket.urgency_label}
        </span>
      ),
    },
    {
      id: 'complexity',
      header: 'Сложность',
      cell: ({ row: { original: ticket } }) => (
        <span className="ticket-table__muted">
          {classifying(ticket) ? 'Определяется' : ticket.complexity_label}
        </span>
      ),
    },
    { id: 'status', header: 'Статус', cell: ({ row }) => <Badge status={row.original.status} /> },
    {
      id: 'created_at',
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
            <Avatar size="small">{ticket.assignee_name[0]}</Avatar>
            {ticket.assignee_name}
          </span>
        ) : (
          <span className="ticket-table__muted">Не назначен</span>
        ),
    },
  ];
  return tab === 'closed' ? [...columns, ratingColumn] : columns;
}
