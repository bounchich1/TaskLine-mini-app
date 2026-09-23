import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

import { events, type ConnectionState } from '@/shared/api/events-stream';
import { queryKeys } from '@/shared/api/query-keys';

/** Everything a server-side change can affect. */
const LIVE_QUERIES = [
  queryKeys.tickets,
  queryKeys.ticket,
  queryKeys.messages,
  queryKeys.notifications,
  queryKeys.dictionaries,
  queryKeys.employees,
];

/**
 * Follows the server's event stream and refetches on every change. `changed` stays set until the
 * employee acknowledges it.
 */
export function useLiveUpdates() {
  const cache = useQueryClient();
  const [connection, setConnection] = useState<ConnectionState>('reconnecting');
  const [changed, setChanged] = useState(false);
  const refresh = useCallback(() => {
    for (const queryKey of LIVE_QUERIES) {
      void cache.invalidateQueries({ queryKey });
    }
    setChanged(true);
  }, [cache]);
  useEffect(() => {
    const controller = new AbortController();
    void events('0', refresh, setConnection, controller.signal);
    return () => {
      controller.abort();
    };
  }, [refresh]);
  return {
    connection,
    changed,
    acknowledge: () => {
      setChanged(false);
    },
    refresh,
  };
}
