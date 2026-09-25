import { clsx } from 'clsx';

import {
    complexityText,
    isClassifying,
    ratingText,
    tagText,
    urgencyText,
} from '@/features/ticket-queue/model/ticket-fields';
import { formatDate } from '@/shared/lib/format-date';
import type { Ticket } from '@/shared/types/api';
import { Status, Urgency } from '@/shared/ui';

import './TicketListItem.scss';

type TicketListItemProps = {
    ticket: Ticket;
    selected: boolean;
    withRating: boolean;
    timezone: string;
    onToggle: (id: string) => void;
};

export function TicketListItem({ ticket, selected, withRating, timezone, onToggle }: TicketListItemProps) {
    return (
        <li className="ticket-item">
            <button
                className={clsx('ticket-item__button', selected && 'ticket-item__button--selected')}
                aria-expanded={selected}
                onClick={() => {
                    onToggle(ticket.id);
                }}
            >
                <span className="ticket-item__line">
                    <span className="ticket-item__number">№{ticket.number}</span>
                    <Status className="ticket-item__status" status={ticket.status} />

                    <time className="ticket-item__date" dateTime={ticket.created_at}>
                        {formatDate(ticket.created_at, timezone)}
                    </time>
                </span>

                <span className="ticket-item__preview">{ticket.description}</span>

                <span className="ticket-item__line ticket-item__line--meta">
                    <Urgency code={isClassifying(ticket) ? '' : ticket.urgency} label={urgencyText(ticket)} />
                    <span className="ticket-item__label">{tagText(ticket)}</span>
                    <span className="ticket-item__label">{complexityText(ticket)}</span>
                    {ticket.review_required ? <span className="ticket-item__review">Проверить</span> : null}
                    <span className="ticket-item__assignee">{ticket.assignee_name ?? 'Не назначен'}</span>
                    {withRating ? <span className="ticket-item__rating">{ratingText(ticket)}</span> : null}
                </span>
            </button>
        </li>
    );
}
