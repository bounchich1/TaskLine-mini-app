import type { Permission, Role, Session, Ticket } from '@/shared/types/api';

const ROLE_ORDER: readonly Role[] = ['support', 'supervisor', 'admin'];

export type TicketAction = 'take' | 'classify' | 'reply' | 'transfer' | 'close' | 'reopen';

const ON_OTHERS_TICKET: Record<Exclude<TicketAction, 'take'>, Permission> = {
    classify: 'tickets.classify_any',
    reply: 'tickets.reply_any',
    transfer: 'tickets.transfer_any',
    close: 'tickets.close_any',
    reopen: 'tickets.reopen_any',
};

export function can(session: Pick<Session, 'permissions'>, permission: Permission): boolean {
    return session.permissions.includes(permission);
}

export function roleRank(role: Role): number {
    return ROLE_ORDER.indexOf(role);
}

export function canOnTicket(session: Session, ticket: Pick<Ticket, 'assignee_id'>, action: TicketAction): boolean {
    if (!can(session, 'tickets.work')) {
        return false;
    }

    if (action === 'take') {
        return true;
    }

    const own = ticket.assignee_id === session.employee.id || (action === 'classify' && ticket.assignee_id === null);

    return own || can(session, ON_OTHERS_TICKET[action]);
}
