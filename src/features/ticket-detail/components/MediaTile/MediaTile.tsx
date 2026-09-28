import { useState } from 'react';

import { useAttachmentMedia } from '@/features/ticket-detail/hooks/use-attachment-media';
import { fileSize, previewsInline, type MediaKind } from '@/features/ticket-detail/model/media';
import { useSeenOnce } from '@/shared/lib/use-seen-once';
import type { Attachment } from '@/shared/types/api';
import { Icon } from '@/shared/ui';

import { AttachmentItem } from '../AttachmentItem/AttachmentItem';
import { MediaViewer } from '../MediaViewer/MediaViewer';

import './MediaTile.scss';

const KIND_LABELS: Record<MediaKind, string> = { image: 'Фото', video: 'Видео' };

export function MediaTile({ file, kind }: { file: Attachment; kind: MediaKind }) {
    const [open, setOpen] = useState(false);
    const [broken, setBroken] = useState(false);
    const { ref, seen } = useSeenOnce<HTMLButtonElement>();
    const inline = previewsInline(file);
    const media = useAttachmentMedia(file, inline && seen);
    const thumbnail = inline ? media.data : undefined;

    if (broken || (inline && media.isError)) {
        return <AttachmentItem file={file} />;
    }

    return (
        <>
            <button
                ref={ref}
                className="media-tile"
                aria-label={`${KIND_LABELS[kind]} ${file.filename}, открыть`}
                onClick={() => {
                    setOpen(true);
                }}
            >
                {thumbnail ? (
                    <img
                        className="media-tile__image"
                        src={thumbnail}
                        alt=""
                        onError={() => {
                            setBroken(true);
                        }}
                    />
                ) : (
                    <span className="media-tile__placeholder">
                        <Icon name={kind === 'video' ? 'play' : 'image'} size={28} />

                        {inline ? null : (
                            <small className="media-tile__caption">
                                {KIND_LABELS[kind]} · {fileSize(file.bytes)}
                            </small>
                        )}
                    </span>
                )}
            </button>

            {open ? (
                <MediaViewer
                    file={file}
                    kind={kind}
                    onClose={() => {
                        setOpen(false);
                    }}
                />
            ) : null}
        </>
    );
}
