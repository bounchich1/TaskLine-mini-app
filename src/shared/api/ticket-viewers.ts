import { useSyncExternalStore } from 'react';

import type { Viewer } from '@/shared/types/routing';

const viewers = new Map<string, Viewer[]>();
const listeners = new Set<() => void>();
const NONE: Viewer[] = [];

export function setTicketViewers(ticketId: string, list: Viewer[]): void {
    if (list.length) {
        viewers.set(ticketId, list);
    } else {
        viewers.delete(ticketId);
    }

    for (const notify of listeners) {
        notify();
    }
}

function subscribe(listener: () => void) {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
}

export function useTicketViewers(ticketId: string): Viewer[] {
    return useSyncExternalStore(subscribe, () => viewers.get(ticketId) ?? NONE);
}
