import { useSyncExternalStore } from 'react';

const TICK_MS = 30000;
const listeners = new Set<() => void>();
let now = Date.now();
let timer: ReturnType<typeof setInterval> | null = null;

function subscribe(listener: () => void) {
    listeners.add(listener);

    timer ??= setInterval(() => {
        now = Date.now();

        for (const notify of listeners) {
            notify();
        }
    }, TICK_MS);

    return () => {
        listeners.delete(listener);

        if (!listeners.size && timer) {
            clearInterval(timer);
            timer = null;
        }
    };
}

const snapshot = () => now;

export function useNow(): number {
    return useSyncExternalStore(subscribe, snapshot, snapshot);
}
