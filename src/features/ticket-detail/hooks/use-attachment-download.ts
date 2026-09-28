import { useState } from 'react';

import { downloadBrowser } from '@/shared/api/download';
import { api } from '@/shared/api/http';
import { bridge } from '@/shared/platform/max-bridge';
import type { Attachment } from '@/shared/types/api';

type DownloadGrant = { url: string; filename: string; expires_at: string };

export function downloadLabel(busy: boolean, needsGrant: boolean) {
    if (busy) {
        return '…';
    }

    return needsGrant ? 'Подготовить' : 'Скачать';
}

export function useAttachmentDownload(file: Attachment) {
    const [grant, setGrant] = useState<DownloadGrant | null>(null);
    const [error, setError] = useState<unknown>(null);
    const [busy, setBusy] = useState(false);
    const host = bridge();
    const native = host?.platform !== 'web' && !!host?.downloadFile;

    const download = () => {
        setError(null);

        if (native && grant && new Date(grant.expires_at).getTime() > Date.now()) {
            try {
                void Promise.resolve(bridge()?.downloadFile?.(grant.url, grant.filename)).catch(setError);
            } catch (error) {
                setError(error);
            }

            return;
        }

        setBusy(true);

        const request = native
            ? api<DownloadGrant>(`/v1/attachments/${file.id}/download-grant`, {
                  method: 'POST',
                  body: {},
              }).then(setGrant)
            : downloadBrowser(file.id, file.filename);

        void request.catch(setError).finally(() => {
            setBusy(false);
        });
    };

    return { download, busy, error, needsGrant: native && !grant };
}
