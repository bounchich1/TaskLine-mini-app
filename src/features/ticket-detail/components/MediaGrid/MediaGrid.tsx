import { clsx } from 'clsx';

import { mediaKind } from '@/features/ticket-detail/model/media';
import type { Attachment } from '@/shared/types/api';

import { MediaTile } from '../MediaTile/MediaTile';

import './MediaGrid.scss';

export function MediaGrid({ files }: { files: Attachment[] }) {
    if (!files.length) {
        return null;
    }

    return (
        <div className={clsx('media-grid', files.length > 1 && 'media-grid--multi')}>
            {files.map((file) => {
                const kind = mediaKind(file);

                return kind ? <MediaTile file={file} kind={kind} key={file.id} /> : null;
            })}
        </div>
    );
}
