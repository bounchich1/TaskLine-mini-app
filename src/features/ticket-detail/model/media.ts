import type { Attachment } from '@/shared/types/api';

const KB = 1024;
const MB = KB * KB;
const AUTO_PREVIEW_BYTES = 5 * MB;

export type MediaKind = 'image' | 'video';

export function mediaKind(file: Attachment): MediaKind | null {
    if (file.status !== 'clean') {
        return null;
    }

    if (file.mime.startsWith('image/') && file.mime !== 'image/svg+xml') {
        return 'image';
    }

    return file.mime.startsWith('video/') ? 'video' : null;
}

export const isMedia = (file: Attachment) => mediaKind(file) !== null;

export const previewsInline = (file: Attachment) =>
    mediaKind(file) === 'image' && Number(file.bytes) <= AUTO_PREVIEW_BYTES;

export function fileSize(bytes: string): string {
    const size = Number(bytes);

    if (size < MB) {
        return `${Math.max(1, Math.round(size / KB))} КБ`;
    }

    return `${(size / MB).toLocaleString('ru-RU', { maximumFractionDigits: 1 })} МБ`;
}
