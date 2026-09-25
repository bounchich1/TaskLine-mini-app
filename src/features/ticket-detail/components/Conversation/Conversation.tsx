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

export function Conversation({ ticket, messages, history, ...messageProps }: ConversationProps) {
    return (
        <div className="conversation">
            <h3 className="conversation__title">Переписка</h3>
            <ErrorNotice error={history.error} />

            {history.hasNextPage ? (
                <Button
                    className="conversation__earlier"
                    variant="ghost"
                    size="xsmall"
                    loading={history.isFetchingNextPage}
                    onClick={() => void history.fetchNextPage()}
                >
                    Загрузить ранние сообщения
                </Button>
            ) : null}

            <ol className="conversation__list" aria-label="История переписки">
                {messages.map((message) => (
                    <MessageItem
                        key={message.id}
                        message={message}
                        attachments={ticket.attachments}
                        {...messageProps}
                    />
                ))}
            </ol>
        </div>
    );
}
