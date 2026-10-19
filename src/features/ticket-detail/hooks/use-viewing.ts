import { useCallback, useEffect, useRef } from 'react';

import { api } from '@/shared/api/http';

const HEARTBEAT_MS = 10000;
const TYPING_THROTTLE_MS = 3000;

type ViewingState = 'viewing' | 'typing' | 'left';

function report(ticketId: string, state: ViewingState): void {
    void api(`/v1/tickets/${ticketId}/viewing`, { method: 'POST', body: { state } }).catch(() => undefined);
}

export function useViewing(ticketId: string | undefined) {
    const lastTyping = useRef(0);

    useEffect(() => {
        if (!ticketId) {
            return;
        }

        report(ticketId, 'viewing');

        const timer = setInterval(() => {
            if (document.visibilityState === 'visible') {
                report(ticketId, 'viewing');
            }
        }, HEARTBEAT_MS);

        return () => {
            clearInterval(timer);
            report(ticketId, 'left');
        };
    }, [ticketId]);

    return useCallback(() => {
        const now = Date.now();

        if (ticketId && now - lastTyping.current > TYPING_THROTTLE_MS) {
            lastTyping.current = now;
            report(ticketId, 'typing');
        }
    }, [ticketId]);
}

export function logTicketEvent(ticketId: string, kind: 'draft_inserted' | 'tip_viewed'): void {
    void api(`/v1/tickets/${ticketId}/events`, { method: 'POST', body: { kind } }).catch(() => undefined);
}
