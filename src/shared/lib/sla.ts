import type { SlaClock, SlaFields, Ticket } from '@/shared/types/api';

import { formatDate } from './format-date';

type SlaTone = 'calm' | 'warning' | 'breached' | 'paused';

export type SlaState = {
    tone: SlaTone;
    clock: SlaClock;
    due: string | null;
    text: string;
};

type SlaTicket = SlaFields & Pick<Ticket, 'status'>;

const MINUTE = 60000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const NOUN: Record<SlaClock, string> = { first_response: 'ответ', resolution: 'решение' };
const LATE: Record<SlaClock, string> = { first_response: 'просрочен', resolution: 'просрочено' };

export function formatSpan(ms: number): string {
    const minutes = Math.max(1, Math.round(ms / MINUTE));

    if (minutes < 60) {
        return `${minutes} мин`;
    }

    if (minutes < 24 * 60) {
        const rest = minutes % 60;

        return rest ? `${Math.floor(minutes / 60)} ч ${rest} мин` : `${minutes / 60} ч`;
    }

    const hours = Math.floor((minutes % (24 * 60)) / 60);

    return hours ? `${Math.floor(minutes / (24 * 60))} д ${hours} ч` : `${Math.floor(minutes / (24 * 60))} д`;
}

function activeClock(ticket: SlaTicket): SlaClock {
    const responseDue = ticket.first_response_due_at ? Date.parse(ticket.first_response_due_at) : Number.NaN;

    return !ticket.first_responded_at && responseDue === Date.parse(ticket.sla_due_at ?? '')
        ? 'first_response'
        : 'resolution';
}

export function slaState(ticket: SlaTicket, now: number, timezone: string): SlaState | null {
    if (!['open', 'in_progress'].includes(ticket.status)) {
        return null;
    }

    const due = ticket.sla_due_at;

    if (!due) {
        return ticket.waiting_since ? { tone: 'paused', clock: 'resolution', due: null, text: 'ждём клиента' } : null;
    }

    const clock = activeClock(ticket);
    const left = new Date(due).getTime() - now;

    if (left <= 0) {
        return { tone: 'breached', clock, due, text: `${NOUN[clock]} ${LATE[clock]} на ${formatSpan(-left)}` };
    }

    const warned = ticket.sla_warn_at ? new Date(ticket.sla_warn_at).getTime() <= now : false;

    const text =
        left < DAY ? `${NOUN[clock]} через ${formatSpan(left)}` : `${NOUN[clock]} до ${formatDate(due, timezone)}`;

    return { tone: warned ? 'warning' : 'calm', clock, due, text };
}
