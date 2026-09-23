import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react';

import { api } from '@/shared/api/http';

import type { Draft, Upload } from '../model/draft';
import {
  FAILED_SCAN_STATUSES,
  MAX_UPLOADS_PER_MESSAGE,
  SCAN_POLL_ATTEMPTS,
  SCAN_POLL_INTERVAL_MS,
  toMegabytes,
  UPLOAD_LIMITS,
  uploadKind,
  type UploadKind,
} from '../model/limits';

type SetDraft = Dispatch<SetStateAction<Draft>>;

/** Creates the upload and sends its content; returns the upload id. */
async function sendFile(ticketId: string | undefined, file: File, kind: UploadKind) {
  const { id } = await api<{ id: string }>('/v1/uploads', {
    method: 'POST',
    body: { ticket_id: ticketId, filename: file.name, kind },
  });
  const form = new FormData();
  form.append('file', file);
  await api(`/v1/uploads/${id}/content`, { method: 'PUT', body: form });
  return id;
}

/** Adds the upload to the draft and polls the server's scan until it is clean. */
async function waitForScan(upload: Upload, setDraft: SetDraft, mounted: RefObject<boolean>) {
  const { id } = upload;
  let value = upload;
  setDraft((draft) => ({ ...draft, uploads: [...draft.uploads, value] }));
  for (let i = 0; i < SCAN_POLL_ATTEMPTS && mounted.current; i++) {
    value = await api<Upload>(`/v1/uploads/${id}/complete`, { method: 'POST', body: {} });
    setDraft((draft) => ({
      ...draft,
      uploads: draft.uploads.map((item) => (item.id === id ? value : item)),
    }));
    if (value.status === 'clean') {
      return;
    }
    if (FAILED_SCAN_STATUSES.includes(value.status)) {
      throw new Error('Файл не прошёл проверку. Удалите его из черновика и выберите другой.');
    }
    await new Promise((resolve) => setTimeout(resolve, SCAN_POLL_INTERVAL_MS));
  }
  if (mounted.current) {
    throw new Error(
      'Проверка файла ещё не завершена. Сохраните черновик и проверьте статус позже.',
    );
  }
}

function checkFile(file: File, uploadCount: number): UploadKind {
  if (uploadCount >= MAX_UPLOADS_PER_MESSAGE) {
    throw new Error('К сообщению можно прикрепить не больше 10 файлов.');
  }
  const kind = uploadKind(file);
  const limit = UPLOAD_LIMITS[kind];
  if (file.size > limit) {
    throw new Error(`Файл слишком большой. Максимум ${toMegabytes(limit)} МБ.`);
  }
  return kind;
}

type AttachmentUploadOptions = {
  ticketId: string | undefined;
  /** Files already in the draft. */
  uploadCount: number;
  setDraft: SetDraft;
};

/** Uploads a file picked through `fileRef` into the draft, then waits for its virus scan. */
export function useAttachmentUpload({ ticketId, uploadCount, setDraft }: AttachmentUploadOptions) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<unknown>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  async function upload(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const kind = checkFile(file, uploadCount);
      const id = await sendFile(ticketId, file, kind);
      await waitForScan({ id, filename: file.name, status: 'quarantined' }, setDraft, mounted);
    } catch (error) {
      if (mounted.current) {
        setUploadError(error);
      }
    } finally {
      if (mounted.current) {
        setUploading(false);
      }
      if (fileRef.current) {
        fileRef.current.value = '';
      }
    }
  }
  return { uploading, uploadError, setUploadError, fileRef, upload };
}
