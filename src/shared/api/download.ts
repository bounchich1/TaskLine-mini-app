import { API_BASE } from '@/shared/config/env';

import { ApiError, authHeaders } from './http';

const OBJECT_URL_LIFETIME_MS = 60000;

export async function fetchBlob(path: string): Promise<Blob> {
    const response = await fetch(`${API_BASE}${path}`, {
        headers: authHeaders(),
        credentials: 'include',
    });

    if (!response.ok) {
        throw new ApiError('download_failed', 'Не удалось скачать файл.', response.status);
    }

    return response.blob();
}

export async function fetchAttachment(id: string): Promise<Blob> {
    return fetchBlob(`/v1/attachments/${id}/download`);
}

export async function downloadBrowser(id: string, filename: string): Promise<void> {
    saveBlob(await fetchAttachment(id), filename);
}

export function saveBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = filename;
    anchor.click();

    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, OBJECT_URL_LIFETIME_MS);
}
