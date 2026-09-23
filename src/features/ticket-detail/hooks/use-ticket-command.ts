import { useMutation } from '@tanstack/react-query';
import { useRef } from 'react';

import { api, ApiError } from '@/shared/api/http';
import type { Ticket } from '@/shared/types/api';

type Command = { action: string; body: unknown };

/** The key and version of a command in flight, reused when the same command is retried. */
type PendingRequest = { signature: string; key: string; version: number };

/** Status 0 (no connection) and 503 may not have reached the server: a retry must replay. */
const isRetryable = (error: unknown) =>
  !(error instanceof ApiError) || error.status === 0 || error.status === 503;

type TicketCommandOptions = {
  id: string;
  /** The ticket version the card shows; sent as If-Match. */
  version: number | undefined;
  refresh: () => Promise<void>;
  onDone: (action: string) => void;
};

/**
 * Runs a ticket command (`POST /v1/tickets/:id/:action`, or PATCH for classification).
 * Retrying the same command after a network error or a 503 reuses its idempotency key and
 * version, so the server can recognise the replay.
 */
export function useTicketCommand({ id, version, refresh, onDone }: TicketCommandOptions) {
  const pendingRequest = useRef<PendingRequest | null>(null);
  const command = useMutation({
    mutationFn: async ({ action, body }: Command) => {
      const signature = JSON.stringify({ id, action, body });
      let request = pendingRequest.current;
      if (request?.signature !== signature) {
        request = { signature, key: crypto.randomUUID(), version: version ?? 0 };
        pendingRequest.current = request;
      }
      try {
        return await api<Ticket>(`/v1/tickets/${id}/${action}`, {
          method: action === 'classification' ? 'PATCH' : 'POST',
          body,
          key: request.key,
          version: request.version,
        });
      } catch (error) {
        if (!isRetryable(error)) {
          pendingRequest.current = null;
        }
        throw error;
      }
    },
    onSuccess: async (_result, variables) => {
      pendingRequest.current = null;
      onDone(variables.action);
      await refresh();
    },
    onError: () => {
      void refresh();
    },
  });
  const operate = (action: string, body: unknown = {}) => {
    command.mutate({ action, body });
  };
  return { command, operate };
}
