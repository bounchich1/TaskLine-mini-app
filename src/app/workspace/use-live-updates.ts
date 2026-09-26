import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

import { events, type ConnectionState, type LiveEvent } from '@/shared/api/events-stream';
import { queryKeys } from '@/shared/api/query-keys';

const LIVE_QUERIES: QueryKey[] = [
    queryKeys.tickets,
    queryKeys.ticket,
    queryKeys.messages,
    queryKeys.notifications,
    queryKeys.dictionaries,
    queryKeys.employees,
];

const BATCH_MS = 300;

const isAdminEvent = (event: LiveEvent) => event.type === 'admin.changed';

function affectedQueries(event: LiveEvent): QueryKey[] {
    if (isAdminEvent(event)) {
        return [queryKeys.dictionaries, queryKeys.employees, queryKeys.adminEmployees];
    }

    const id = event.ticket_id;

    return [
        queryKeys.tickets,
        queryKeys.notifications,
        id ? queryKeys.ticketDetail(id) : queryKeys.ticket,
        id ? queryKeys.ticketMessages(id) : queryKeys.messages,
    ];
}

export function useLiveUpdates() {
    const cache = useQueryClient();
    const [connection, setConnection] = useState<ConnectionState>('reconnecting');
    const [changed, setChanged] = useState(false);
    const pending = useRef(new Map<string, QueryKey>());
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const flush = useCallback(() => {
        if (timer.current) {
            clearTimeout(timer.current);
            timer.current = null;
        }

        for (const queryKey of pending.current.values()) {
            void cache.invalidateQueries({ queryKey });
        }

        pending.current.clear();
    }, [cache]);

    const schedule = useCallback(
        (keys: QueryKey[]) => {
            for (const key of keys) {
                pending.current.set(JSON.stringify(key), key);
            }

            timer.current ??= setTimeout(flush, BATCH_MS);
        },
        [flush],
    );

    useEffect(() => {
        const controller = new AbortController();

        void events(
            {
                onEvents: (batch) => {
                    schedule(batch.flatMap(affectedQueries));

                    if (!batch.every(isAdminEvent)) {
                        setChanged(true);
                    }
                },
                onResync: () => {
                    schedule(LIVE_QUERIES);
                },
                onState: setConnection,
            },
            controller.signal,
        );

        return () => {
            controller.abort();
            flush();
        };
    }, [schedule, flush]);

    return {
        connection,
        changed,
        acknowledge: () => {
            setChanged(false);
        },
        refresh: () => {
            schedule(LIVE_QUERIES);
            flush();
        },
    };
}
