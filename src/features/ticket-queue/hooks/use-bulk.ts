import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { api } from '@/shared/api/http';
import { queryKeys } from '@/shared/api/query-keys';

export type BulkAction =
    | { action: 'assign'; employee_id: string }
    | { action: 'team'; team_id: string | null }
    | { action: 'classify'; tag?: string; urgency?: string; complexity?: string }
    | { action: 'close'; text?: string };

type BulkResult = { id: string; number?: number; ok: boolean; code?: string; message?: string };

export type BulkSummary = { done: number; failed: BulkResult[] };

export function useBulk() {
    const cache = useQueryClient();
    const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
    const [summary, setSummary] = useState<BulkSummary | null>(null);

    const run = useMutation({
        mutationFn: (request: BulkAction) =>
            api<{ results: BulkResult[] }>('/v1/tickets/bulk', {
                method: 'POST',
                body: { ...request, ids: [...selected] },
            }),
        onSuccess: ({ results }) => {
            const failed = results.filter((result) => !result.ok);

            setSummary({ done: results.length - failed.length, failed });
            setSelected(new Set(failed.map((result) => result.id)));
            void cache.invalidateQueries({ queryKey: queryKeys.tickets });
            void cache.invalidateQueries({ queryKey: queryKeys.ticket });
        },
    });

    return {
        selected,
        summary,
        run,
        onSelect: (ids: string[], checked: boolean) => {
            setSummary(null);

            setSelected((current) => {
                const next = new Set(current);

                for (const id of ids) {
                    if (checked) {
                        next.add(id);
                    } else {
                        next.delete(id);
                    }
                }

                return next;
            });
        },
        clear: () => {
            setSelected(new Set());
            setSummary(null);
        },
    };
}

export type Bulk = ReturnType<typeof useBulk>;
