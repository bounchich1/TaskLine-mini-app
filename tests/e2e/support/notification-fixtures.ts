import { CLOSED_TICKETS, OPEN_TICKETS } from './fixtures';

const [LATE_TICKET, MY_TICKET, NEW_TICKET] = OPEN_TICKETS;
const [RATED_TICKET] = CLOSED_TICKETS;

export const NOTIFICATIONS = [
    {
        id: 'n1',
        type: 'ticket.created',
        ticket_id: 't3',
        read_at: null,
        created_at: '2026-03-02T03:58:00Z',
        payload: {},
        preview: null,
        actor_name: null,
        ticket: NEW_TICKET,
    },
    {
        id: 'n4',
        type: 'message.from_client',
        ticket_id: 't2',
        read_at: null,
        created_at: '2026-03-02T03:50:00Z',
        payload: { message_id: 'msg5' },
        preview: 'Списание было 28 февраля, карта на 4417.',
        actor_name: null,
        ticket: MY_TICKET,
    },
    {
        id: 'n6',
        type: 'sla.response_breached',
        ticket_id: 't1',
        read_at: null,
        created_at: '2026-03-02T03:45:00Z',
        payload: { clock: 'first_response', stage: 2 },
        preview: null,
        actor_name: null,
        ticket: LATE_TICKET,
    },
    {
        id: 'n5',
        type: 'ticket.transferred',
        ticket_id: 't2',
        read_at: null,
        created_at: '2026-03-02T03:00:00Z',
        payload: { from: 'e2', comment: 'Клиент просит вернуть второе списание' },
        preview: null,
        actor_name: 'Борис Иванов',
        ticket: MY_TICKET,
    },
    {
        id: 'n2',
        type: 'rating.received',
        ticket_id: 't9',
        read_at: '2026-03-01T11:00:00Z',
        created_at: '2026-03-01T10:00:00Z',
        payload: { value: 9 },
        preview: null,
        actor_name: null,
        ticket: RATED_TICKET,
    },
];
