import { useState } from 'react';

import { downloadBrowser } from '@/shared/api/download';
import { api } from '@/shared/api/http';
import { attachmentStatusLabel } from '@/shared/config/labels';
import { bridge } from '@/shared/platform/max-bridge';
import type { Attachment } from '@/shared/types/api';
import { ErrorNotice, Icon } from '@/shared/ui';

type DownloadGrant = { url: string; filename: string; expires_at: string };

const fileSize = (bytes: string) => `${Math.max(1, Math.round(Number(bytes) / 1024))} КБ`;

function downloadLabel(busy: boolean, needsGrant: boolean) {
  if (busy) {
    return '…';
  }
  return needsGrant ? 'Подготовить' : 'Скачать';
}

/** Inside MAX, prepare a short-lived link first, then hand it to the host to download. */
function useAttachmentDownload(file: Attachment) {
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

/** An attachment of a message, with its scan status and a download button once clean. */
export function AttachmentItem({ file }: { file: Attachment }) {
  const { download, busy, error, needsGrant } = useAttachmentDownload(file);
  return (
    <div className="attachment">
      <Icon name="clip" size={17} />
      <div>
        <strong>{file.filename}</strong>
        <small>
          {file.status === 'clean' ? fileSize(file.bytes) : attachmentStatusLabel(file.status)}
        </small>
        <ErrorNotice error={error} />
      </div>
      {file.status === 'clean' ? (
        <button className="text-button" disabled={busy} onClick={download}>
          {downloadLabel(busy, needsGrant)}
          <Icon name="download" size={14} />
        </button>
      ) : null}
    </div>
  );
}
