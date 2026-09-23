import { authorLabel } from '@/shared/config/labels';
import { formatDate } from '@/shared/lib/format-date';
import type { Attachment, Message } from '@/shared/types/api';

import { AttachmentItem } from '../AttachmentItem/AttachmentItem';
import { DeliveryStatus } from '../DeliveryStatus/DeliveryStatus';

type MessageItemProps = {
  message: Message;
  attachments: Attachment[] | undefined;
  timezone: string;
  canAct: boolean;
  canSend: boolean;
  onChanged: () => Promise<void>;
  onError: (error: unknown) => void;
};

/** One message of the conversation with its attachments and, for staff, its delivery. */
export function MessageItem({ message, attachments, timezone, ...delivery }: MessageItemProps) {
  return (
    <div className={`message message-${message.author_type}`}>
      <div className="message-meta">
        <strong>{authorLabel(message.author_type, message.author_name)}</strong>
        <time dateTime={message.created_at}>{formatDate(message.created_at, timezone)}</time>
        {message.revision > 1 ? <span>изменено</span> : null}
      </div>
      <div className="message-body">
        {message.deleted ? <em>Сообщение удалено клиентом</em> : message.text}
        {attachments
          ?.filter((file) => file.message_id === message.id)
          .map((file) => (
            <AttachmentItem file={file} key={file.id} />
          ))}
      </div>
      {message.author_type === 'staff' ? <DeliveryStatus message={message} {...delivery} /> : null}
    </div>
  );
}
