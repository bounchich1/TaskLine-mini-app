import { API_BASE } from '@/shared/config/env';

import { ApiError, authHeaders } from './http';

const OBJECT_URL_LIFETIME_MS = 60000;

export async function fetchAttachment(id: string): Promise<Blob> {
    const response = await fetch(`${API_BASE}/v1/attachments/${id}/download`, {
        headers: authHeaders(),
        credentials: 'include',
    });

    if (!response.ok) {
        throw new ApiError('download_failed', 'Не удалось скачать файл.', response.status);
    }

    return response.blob();
}

export async function downloadBrowser(id: string, filename: string): Promise<void> {
    const url = URL.createObjectURL(await fetchAttachment(id));
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = filename;
    anchor.click();

    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, OBJECT_URL_LIFETIME_MS);
}
