export const MAX_REPLY_LENGTH = 4000;
export const MAX_NOTE_LENGTH = 2000;
export const MAX_UPLOADS_PER_MESSAGE = 10;

const MB = 1024 * 1024;

export type UploadKind = 'image' | 'video' | 'file';

export const UPLOAD_LIMITS: Readonly<Record<UploadKind, number>> = {
  image: 20 * MB,
  video: 100 * MB,
  file: 25 * MB,
};

export const uploadKind = (file: File): UploadKind => {
  if (file.type.startsWith('image/')) {
    return 'image';
  }
  return file.type.startsWith('video/') ? 'video' : 'file';
};

export const toMegabytes = (bytes: number) => bytes / MB;

/** The server scans every upload; the card polls for the verdict this many times. */
export const SCAN_POLL_ATTEMPTS = 60;
export const SCAN_POLL_INTERVAL_MS = 1500;
export const FAILED_SCAN_STATUSES = ['infected', 'rejected', 'failed', 'canceled'];

export const ACCEPTED_FILES = 'image/*,video/*,.pdf,.txt,.doc,.docx,.xls,.xlsx';
