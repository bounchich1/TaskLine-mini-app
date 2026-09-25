import { useMutation } from '@tanstack/react-query';
import { useRef } from 'react';

import { api, ApiError } from '@/shared/api/http';
import type { Ticket } from '@/shared/types/api';

type Command = { action: string; body: unknown };

type PendingRequest = { signature: string; key: string; version: number };

const isRetryable = (error: unknown) => !(error instanceof ApiError) || error.status === 0 || error.status === 503;

type TicketCommandOptions = {
    id: string;
    version: number | undefined;
    refresh: () => Promise<void>;
    onDone: (action: string) => void;
};

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
