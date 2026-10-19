import { can, canOnTicket } from '@/shared/lib/access';
import { formatDate } from '@/shared/lib/format-date';
import type { Session, Ticket } from '@/shared/types/api';

import type { TicketPermissions } from '../TicketActions/TicketActions';

export function ticketAbilities(session: Session, ticket: Ticket) {
    const allowed: TicketPermissions = {
        take: canOnTicket(session, ticket, 'take'),
        wait: canOnTicket(session, ticket, 'reply'),
        transfer: canOnTicket(session, ticket, 'transfer'),
        close: canOnTicket(session, ticket, 'close'),
        reopen: canOnTicket(session, ticket, 'reopen'),
    };

    const canAct = canOnTicket(session, ticket, 'reply');

    return {
        allowed,
        active: ['open', 'in_progress'].includes(ticket.status),
        canAct,
        canSend: ticket.status === 'in_progress' && canAct,
        canNote: can(session, 'tickets.work') && !ticket.purged_at,
        canClassify: canOnTicket(session, ticket, 'classify'),
        macroContext: (timezone: string) => ({
            ticketNumber: ticket.number,
            agentName: session.employee.name,
            eta: ticket.resolution_due_at ? formatDate(ticket.resolution_due_at, timezone) : 'в ближайшее время',
        }),
    };
}
