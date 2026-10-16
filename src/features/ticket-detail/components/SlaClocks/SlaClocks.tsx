import { clsx } from 'clsx';

import { formatDate } from '@/shared/lib/format-date';
import { formatSpan } from '@/shared/lib/sla';
import { useNow } from '@/shared/lib/use-now';
import type { SlaClock, Ticket } from '@/shared/types/api';

import { PropertyRow } from '../PropertyRow/PropertyRow';

import './SlaClocks.scss';

type ClockView = { text: string; late: boolean };

const isLate = (due: string | null | undefined, at: number) => Boolean(due && new Date(due).getTime() < at);

function responseView(ticket: Ticket, now: number, timezone: string): ClockView | null {
    const breached = ticket.sla_breached?.includes('first_response') ?? false;

    if (ticket.first_responded_at) {
        return {
            text: `дан ${formatDate(ticket.first_responded_at, timezone)}${breached ? ', с опозданием' : ''}`,
            late: breached,
        };
    }

    if (!ticket.first_response_due_at) {
        return null;
    }

    return {
        text: `до ${formatDate(ticket.first_response_due_at, timezone)}`,
        late: isLate(ticket.first_response_due_at, now),
    };
}

function resolutionView(ticket: Ticket, now: number, timezone: string): ClockView | null {
    const breached = ticket.sla_breached?.includes('resolution') ?? false;

    if (!['open', 'in_progress'].includes(ticket.status)) {
        return ticket.resolution_due_at ? { text: breached ? 'срок нарушен' : 'в срок', late: breached } : null;
    }

    if (ticket.waiting_since) {
        return { text: `пауза — ждём клиента с ${formatDate(ticket.waiting_since, timezone)}`, late: false };
    }

    if (!ticket.resolution_due_at) {
        return null;
    }

    return {
        text: `до ${formatDate(ticket.resolution_due_at, timezone)}`,
        late: isLate(ticket.resolution_due_at, now),
    };
}

const LABELS: Record<SlaClock, string> = { first_response: 'Первый ответ', resolution: 'Решение' };

export function SlaClocks({ ticket, timezone }: { ticket: Ticket; timezone: string }) {
    const now = useNow();

    const views: [SlaClock, ClockView | null][] = [
        ['first_response', responseView(ticket, now, timezone)],
        ['resolution', resolutionView(ticket, now, timezone)],
    ];

    const paused = ticket.sla_paused_seconds ?? 0;

    return (
        <>
            {views.map(([clock, view]) =>
                view ? (
                    <PropertyRow key={clock} label={LABELS[clock]}>
                        <span className={clsx('sla-clock', view.late && 'sla-clock--late')}>{view.text}</span>
                    </PropertyRow>
                ) : null,
            )}

            {paused > 0 ? (
                <PropertyRow label="На паузе">{`${formatSpan(paused * 1000)} рабочего времени`}</PropertyRow>
            ) : null}
        </>
    );
}
