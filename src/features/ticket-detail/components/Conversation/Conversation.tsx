import { Button } from '@maxhub/max-ui';

import type { useTicketMessages } from '@/features/ticket-detail/hooks/use-ticket-messages';
import type { Message, Ticket } from '@/shared/types/api';
import { ErrorNotice } from '@/shared/ui';

import { MessageItem } from '../MessageItem/MessageItem';

import './Conversation.scss';

type ConversationProps = {
  ticket: Ticket;
  messages: Message[];
  history: ReturnType<typeof useTicketMessages>;
  timezone: string;
  canAct: boolean;
  canSend: boolean;
  onChanged: () => Promise<void>;
  onError: (error: unknown) => void;
};

/** The message history, oldest first, with a button to load earlier pages. */
export function Conversation({ ticket, messages, history, ...messageProps }: ConversationProps) {
  return (
    <>
      <div className="conversation__header">
        <h3 className="conversation__title">Переписка</h3>
        <span className="conversation__count">{messages.length} сообщений загружено</span>
      </div>
      <ErrorNotice error={history.error} />
      <div className="conversation__list" aria-label="История переписки">
        {history.hasNextPage ? (
          <Button
            variant="ghost"
            size="small"
            loading={history.isFetchingNextPage}
            onClick={() => void history.fetchNextPage()}
          >
            Загрузить ранние сообщения
          </Button>
        ) : null}
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            attachments={ticket.attachments}
            {...messageProps}
          />
        ))}
      </div>
    </>
  );
}
