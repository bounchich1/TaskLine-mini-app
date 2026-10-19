import { Button } from '@maxhub/max-ui';

import type { useAttachmentUpload } from '@/features/ticket-detail/hooks/use-attachment-upload';
import { MAX_REPLY_LENGTH } from '@/features/ticket-detail/model/limits';
import { Icon } from '@/shared/ui';

import { AttachButton } from '../AttachButton/AttachButton';

type ComposerBarProps = {
    note: boolean;
    length: number;
    uploads: ReturnType<typeof useAttachmentUpload>;
    attachDisabled: boolean;
    pending: boolean;
    sendable: boolean;
};

export function ComposerBar({ note, length, uploads, attachDisabled, pending, sendable }: ComposerBarProps) {
    return (
        <div className="composer__bar">
            {note ? (
                <span className="composer__hint">Видна только сотрудникам</span>
            ) : (
                <AttachButton uploads={uploads} disabled={attachDisabled} />
            )}

            {length > 0 ? (
                <span className="composer__count">
                    {length} / {MAX_REPLY_LENGTH}
                </span>
            ) : null}

            <Button
                type="submit"
                size="xsmall"
                title="Ctrl+Enter"
                iconAfter={<Icon name={note ? 'note' : 'send'} size={15} />}
                loading={pending}
                disabled={!sendable && !pending}
            >
                {note ? 'Сохранить заметку' : 'Отправить'}
            </Button>
        </div>
    );
}
