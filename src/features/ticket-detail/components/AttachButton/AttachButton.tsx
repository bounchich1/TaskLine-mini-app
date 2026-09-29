import { clsx } from 'clsx';

import type { useAttachmentUpload } from '@/features/ticket-detail/hooks/use-attachment-upload';
import { Icon } from '@/shared/ui';

type AttachButtonProps = {
    uploads: ReturnType<typeof useAttachmentUpload>;
    disabled: boolean;
};

export function AttachButton({ uploads, disabled }: AttachButtonProps) {
    const { uploading, fileRef, upload } = uploads;
    const blocked = disabled || uploading;

    return (
        <label className={clsx('composer__attach', blocked && 'composer__attach--disabled')}>
            <input
                type="file"
                className="composer__file"
                ref={fileRef}
                disabled={blocked}
                onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (file) {
                        void upload(file);
                    }
                }}
            />

            <Icon name="clip" size={18} />
            <span className="composer__attach-label">{uploading ? 'Проверяем файл…' : 'Прикрепить файл'}</span>
        </label>
    );
}
