import { Button } from '@maxhub/max-ui';
import type { ReactNode } from 'react';

import type { Suggestion, Ticket } from '@/shared/types/api';
import { Icon } from '@/shared/ui';

type AiSuggestionPanelProps = {
  ticket: Ticket;
  /** Inserting into the draft is allowed. */
  canInsert: boolean;
  onInsert: (text: string) => void;
};

const sourcesNote = (suggestion: Suggestion) =>
  suggestion.evidence_memory_ids.length
    ? ` · Источников: ${suggestion.evidence_memory_ids.length}`
    : '';

/** The assistant's classification status and suggested solution, visible to the team only. */
export function AiSuggestionPanel({ ticket, canInsert, onInsert }: AiSuggestionPanelProps) {
  const { suggestion } = ticket;
  const solution = suggestion?.suggested_solution;
  let content: ReactNode;
  if (ticket.ai_status === 'pending') {
    content = <p>Изучает первое сообщение. Можно отвечать, не дожидаясь подсказки.</p>;
  } else if (ticket.suggestion_stale) {
    content = <p>Подсказка устарела после изменения обращения. Проверьте актуальную переписку.</p>;
  } else if (suggestion && solution) {
    content = (
      <>
        <p className="suggestion">{solution}</p>
        {suggestion.missing_information.length > 0 ? (
          <div className="missing-info">
            <strong>Что уточнить</strong>
            <ul>
              {suggestion.missing_information.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <Button
          variant="secondary"
          size="small"
          stretched
          disabled={!canInsert}
          onClick={() => {
            onInsert(solution);
          }}
        >
          Вставить в черновик
        </Button>
        <small>
          Проверьте перед отправкой
          {sourcesNote(suggestion)}
        </small>
      </>
    );
  } else {
    content = (
      <>
        <p>
          {ticket.ai_status === 'failed'
            ? 'Автоматическая классификация недоступна. Проверьте параметры вручную.'
            : 'Недостаточно данных для надёжной подсказки.'}
        </p>
        <span className="manual-label">Нужна проверка сотрудником</span>
      </>
    );
  }
  return (
    <div className="ai-panel">
      <div className="ai-title">
        <span>
          <Icon name="spark" size={18} />
          Помощник
        </span>
        <span className="private-label">Только команде</span>
      </div>
      {content}
    </div>
  );
}
