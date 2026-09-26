import { sourceHint } from '@/features/ticket-detail/model/suggestion';
import { formatDate } from '@/shared/lib/format-date';
import type { SourceExcerpt } from '@/shared/types/api';

import { MessageItem } from '../MessageItem/MessageItem';

import './SourceExcerptView.scss';

const noChange = () => Promise.resolve();
const ignoreError = () => undefined;

export function SourceExcerptView({ excerpt, timezone }: { excerpt: SourceExcerpt; timezone: string }) {
    const { source, messages, attachments, highlight } = excerpt;

    return (
        <>
            <div className="source-excerpt__facts">
                <span className="source-excerpt__meta">
                    Закрытие {source.cycle_no} · {formatDate(source.closed_at, timezone)}
                </span>

                {source.state === 'ok' ? null : <span className="source-excerpt__warning">{sourceHint(source)}</span>}
                {source.problem ? <span>Проблема: {source.problem}</span> : null}
                {source.solution ? <span>Решение: {source.solution}</span> : null}
            </div>

            <ol className="source-excerpt__messages" aria-label="Переписка с решением">
                {messages.map((message) => (
                    <MessageItem
                        key={message.id}
                        message={message}
                        attachments={attachments}
                        timezone={timezone}
                        highlighted={highlight.includes(message.id)}
                        canAct={false}
                        canSend={false}
                        onChanged={noChange}
                        onError={ignoreError}
                    />
                ))}
            </ol>

            {excerpt.truncated ? (
                <small className="source-excerpt__note">
                    Показаны ключевые сообщения. Вся переписка — в обращении.
                </small>
            ) : null}
        </>
    );
}
