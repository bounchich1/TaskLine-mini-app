import { API_BASE } from '@/shared/config/env';

import { ApiError, authHeaders } from './http';

const OBJECT_URL_LIFETIME_MS = 60000;

export async function downloadBrowser(id: string, filename: string): Promise<void> {
    const response = await fetch(`${API_BASE}/v1/attachments/${id}/download`, {
        headers: authHeaders(),
        credentials: 'include',
    });

    if (!response.ok) {
        throw new ApiError('download_failed', 'Не удалось скачать файл.', response.status);
    }

    const url = URL.createObjectURL(await response.blob());
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = filename;
    anchor.click();

    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, OBJECT_URL_LIFETIME_MS);
}
