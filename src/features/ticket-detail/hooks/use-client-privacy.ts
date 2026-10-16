import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { fetchBlob, saveBlob } from '@/shared/api/download';
import { api } from '@/shared/api/http';
import { queryKeys } from '@/shared/api/query-keys';
import { bridge } from '@/shared/platform/max-bridge';

type ExportGrant = { url: string; filename: string; expires_at: string };

export type Erasure = { client_id: string; tickets: number; already_erased: boolean };

type Busy = 'export' | 'erase' | null;

const exportFilename = (clientId: string) => `client-data-${clientId.slice(0, 8)}.json`;

export function exportLabel(busy: boolean, needsGrant: boolean) {
    if (busy) {
        return '…';
    }

    return needsGrant ? 'Подготовить выгрузку' : 'Выгрузить данные';
}

const isFresh = (grant: ExportGrant | null): grant is ExportGrant =>
    !!grant && new Date(grant.expires_at).getTime() > Date.now();

export function useClientPrivacy(clientId: string) {
    const cache = useQueryClient();
    const [busy, setBusy] = useState<Busy>(null);
    const [error, setError] = useState<unknown>(null);
    const [grant, setGrant] = useState<ExportGrant | null>(null);
    const [erasure, setErasure] = useState<Erasure | null>(null);
    const host = bridge();
    const native = host?.platform !== 'web' && !!host?.downloadFile;
    const base = `/v1/admin/clients/${clientId}`;

    const run = (kind: Exclude<Busy, null>, task: () => Promise<void>) => {
        setError(null);
        setBusy(kind);

        void task()
            .catch(setError)
            .finally(() => {
                setBusy(null);
            });
    };

    const exportData = () => {
        if (native && isFresh(grant)) {
            setError(null);

            try {
                void Promise.resolve(host.downloadFile?.(grant.url, grant.filename)).catch(setError);
            } catch (failure) {
                setError(failure);
            }

            return;
        }

        run('export', async () => {
            if (native) {
                setGrant(await api<ExportGrant>(`${base}/export-grant`, { method: 'POST', body: {} }));

                return;
            }

            saveBlob(await fetchBlob(`${base}/export`), exportFilename(clientId));
        });
    };

    const erase = (onDone: () => void) => {
        run('erase', async () => {
            setErasure(await api<Erasure>(`${base}/erase`, { method: 'POST', body: { confirm: true } }));
            await cache.invalidateQueries({ queryKey: queryKeys.tickets });
            await cache.invalidateQueries({ queryKey: queryKeys.ticket });
            onDone();
        });
    };

    return { busy, error, needsGrant: native && !grant, erasure, exportData, erase };
}
