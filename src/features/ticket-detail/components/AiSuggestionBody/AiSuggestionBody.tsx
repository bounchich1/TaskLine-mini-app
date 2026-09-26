import { hasAdvice } from '@/features/ticket-detail/model/suggestion';
import type { Ticket } from '@/shared/types/api';

import { SuggestionAdvice } from '../SuggestionAdvice/SuggestionAdvice';

type AiSuggestionBodyProps = {
    ticket: Ticket;
    canInsert: boolean;
    onInsert: (text: string) => void;
    onSource: (memoryId: string) => void;
};

export function AiSuggestionBody({ ticket, canInsert, onInsert, onSource }: AiSuggestionBodyProps) {
    const { suggestion } = ticket;

    if (ticket.ai_status === 'pending') {
        return <p className="ai-panel__status">Разбирает первое сообщение. Отвечать можно не дожидаясь.</p>;
    }

    if (ticket.suggestion_stale) {
        return <p className="ai-panel__status">Подсказка устарела после изменений в обращении.</p>;
    }

    if (!hasAdvice(suggestion)) {
        return (
            <p className="ai-panel__status ai-panel__status--review">
                {ticket.ai_status === 'failed'
                    ? 'Классификация не удалась — проверьте тег, срочность и сложность вручную.'
                    : 'Недостаточно данных для подсказки — проверьте классификацию вручную.'}
            </p>
        );
    }

    return (
        <SuggestionAdvice
            suggestion={suggestion}
            sources={ticket.suggestion_sources ?? []}
            canInsert={canInsert}
            onInsert={onInsert}
            onSource={onSource}
        />
    );
}
