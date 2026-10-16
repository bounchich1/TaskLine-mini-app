import { clsx } from 'clsx';

import { formatDate } from '@/shared/lib/format-date';
import { slaState } from '@/shared/lib/sla';
import { useNow } from '@/shared/lib/use-now';
import type { Ticket } from '@/shared/types/api';

import './SlaChip.scss';

type SlaChipProps = {
    ticket: Ticket;
    timezone: string;
    className?: string;
};

export function SlaChip({ ticket, timezone, className }: SlaChipProps) {
    const now = useNow();
    const state = slaState(ticket, now, timezone);

    if (!state) {
        return null;
    }

    return (
        <span
            className={clsx('sla-chip', `sla-chip--${state.tone}`, className)}
            title={state.due ? `Срок: ${formatDate(state.due, timezone)}` : undefined}
        >
            {state.text}
        </span>
    );
}
