import { clsx } from 'clsx';

import { authorLabel } from '@/shared/config/labels';
import { formatDate } from '@/shared/lib/format-date';
import type { Attachment, Message } from '@/shared/types/api';

import { AttachmentItem } from '../AttachmentItem/AttachmentItem';
import { DeliveryStatus } from '../DeliveryStatus/DeliveryStatus';

import './MessageItem.scss';

type MessageItemProps = {
    message: Message;
    attachments: Attachment[] | undefined;
    timezone: string;
    canAct: boolean;
    canSend: boolean;
    onChanged: () => Promise<void>;
    onError: (error: unknown) => void;
    highlighted?: boolean;
};

export function MessageItem({ message, attachments, timezone, highlighted = false, ...delivery }: MessageItemProps) {
    const files = attachments?.filter((file) => file.message_id === message.id) ?? [];
    const hasBody = message.deleted || message.text.length > 0;

    return (
        <li className={clsx('message', `message--${message.author_type}`, highlighted && 'message--highlighted')}>
            <div className="message__meta">
                <strong className="message__author">{authorLabel(message.author_type, message.author_name)}</strong>
                <time dateTime={message.created_at}>{formatDate(message.created_at, timezone)}</time>
                {message.revision > 1 ? <span>· изменено</span> : null}
            </div>

            {hasBody ? (
                <div className="message__bubble">
                    {message.deleted ? <em className="message__deleted">Сообщение удалено клиентом</em> : message.text}
                </div>
            ) : null}

            {files.map((file) => (
                <AttachmentItem file={file} key={file.id} />
            ))}

            {message.author_type === 'staff' ? <DeliveryStatus message={message} {...delivery} /> : null}
        </li>
    );
}
