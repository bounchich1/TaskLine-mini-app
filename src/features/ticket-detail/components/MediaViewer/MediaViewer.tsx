import { useEffect, useRef, useState } from 'react';

import { downloadLabel, useAttachmentDownload } from '@/features/ticket-detail/hooks/use-attachment-download';
import { useAttachmentMedia } from '@/features/ticket-detail/hooks/use-attachment-media';
import type { MediaKind } from '@/features/ticket-detail/model/media';
import type { Attachment } from '@/shared/types/api';
import { ErrorNotice, Icon } from '@/shared/ui';

import './MediaViewer.scss';

type MediaViewerProps = {
    file: Attachment;
    kind: MediaKind;
    onClose: () => void;
};

function stageMessage(failed: boolean, unplayable: boolean) {
    if (unplayable) {
        return 'Видео не воспроизводится в приложении. Скачайте файл.';
    }

    return failed ? 'Не удалось загрузить файл.' : 'Загрузка…';
}

export function MediaViewer({ file, kind, onClose }: MediaViewerProps) {
    const ref = useRef<HTMLDialogElement>(null);
    const media = useAttachmentMedia(file, true);
    const { download, busy, error, needsGrant } = useAttachmentDownload(file);
    const [unplayable, setUnplayable] = useState(false);
    const url = unplayable ? undefined : media.data;

    useEffect(() => {
        const dialog = ref.current;
        const previous = document.activeElement as HTMLElement | null;

        dialog?.showModal();

        return () => {
            dialog?.close();
            previous?.focus();
        };
    }, []);

    return (
        <dialog
            ref={ref}
            className="media-viewer"
            aria-label={file.filename}
            onCancel={(event) => {
                event.preventDefault();
                onClose();
            }}
        >
            <div className="media-viewer__bar">
                <span className="media-viewer__name" title={file.filename}>
                    {file.filename}
                </span>

                <button className="media-viewer__action" disabled={busy} onClick={download}>
                    <Icon name="download" size={18} />
                    {downloadLabel(busy, needsGrant)}
                </button>

                <button className="media-viewer__close" aria-label="Закрыть просмотр" onClick={onClose}>
                    <Icon name="close" size={20} />
                </button>
            </div>

            <ErrorNotice className="media-viewer__error" error={error} />

            <div className="media-viewer__stage">
                {url && kind === 'image' ? <img className="media-viewer__media" src={url} alt={file.filename} /> : null}

                {url && kind === 'video' ? (
                    // eslint-disable-next-line jsx-a11y/media-has-caption
                    <video
                        className="media-viewer__media"
                        src={url}
                        controls
                        autoPlay
                        playsInline
                        onError={() => {
                            setUnplayable(true);
                        }}
                    />
                ) : null}

                {url ? null : <p className="media-viewer__message">{stageMessage(media.isError, unplayable)}</p>}
            </div>
        </dialog>
    );
}
