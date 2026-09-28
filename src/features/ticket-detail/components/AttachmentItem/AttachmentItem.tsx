import { downloadLabel, useAttachmentDownload } from '@/features/ticket-detail/hooks/use-attachment-download';
import { fileSize } from '@/features/ticket-detail/model/media';
import { attachmentStatusLabel } from '@/shared/config/labels';
import type { Attachment } from '@/shared/types/api';
import { ErrorNotice, Icon } from '@/shared/ui';

import './AttachmentItem.scss';

export function AttachmentItem({ file }: { file: Attachment }) {
    const { download, busy, error, needsGrant } = useAttachmentDownload(file);

    return (
        <div className="attachment">
            <span className="attachment__icon">
                <Icon name="file" size={18} />
            </span>

            <div className="attachment__info">
                <strong className="attachment__name" title={file.filename}>
                    {file.filename}
                </strong>

                <small className="attachment__status">
                    {file.status === 'clean' ? fileSize(file.bytes) : attachmentStatusLabel(file.status)}
                </small>

                <ErrorNotice className="attachment__error" error={error} />
            </div>

            {file.status === 'clean' ? (
                <button className="attachment__download" disabled={busy} onClick={download}>
                    <Icon name="download" size={14} />
                    {downloadLabel(busy, needsGrant)}
                </button>
            ) : null}
        </div>
    );
}
