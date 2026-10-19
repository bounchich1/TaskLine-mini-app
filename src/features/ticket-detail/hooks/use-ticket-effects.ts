import { useEffect, useLayoutEffect, useRef } from 'react';

import type { Ticket } from '@/shared/types/api';

import { logTicketEvent } from './use-viewing';

type TicketEffects = { id: string; ticket: Ticket | undefined; me: string; operate: (action: string) => void };

export function useTicketEffects({ id, ticket, me, operate }: TicketEffects) {
    const operateRef = useRef(operate);
    const claimed = useRef<string | null>(null);
    const offeredToMe = ticket?.status === 'open' && ticket.offered_to === me;
    const ticketId = ticket?.id;
    const tipped = Boolean(ticket?.suggestion);

    useLayoutEffect(() => {
        operateRef.current = operate;
    });

    useEffect(() => {
        if (offeredToMe && ticketId && claimed.current !== ticketId) {
            claimed.current = ticketId;
            operateRef.current('assign');
        }
    }, [offeredToMe, ticketId]);

    useEffect(() => {
        if (tipped) {
            logTicketEvent(id, 'tip_viewed');
        }
    }, [id, tipped]);
}
