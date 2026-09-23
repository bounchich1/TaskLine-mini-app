import { Button } from '@maxhub/max-ui';
import type { ReactNode } from 'react';

import type { Suggestion, Ticket } from '@/shared/types/api';
import { Icon } from '@/shared/ui';

import './AiSuggestionPanel.scss';

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
    content = (
      <p className="ai-panel__text">
        Изучает первое сообщение. Можно отвечать, не дожидаясь подсказки.
      </p>
    );
  } else if (ticket.suggestion_stale) {
    content = (
      <p className="ai-panel__text">
        Подсказка устарела после изменения обращения. Проверьте актуальную переписку.
      </p>
    );
  } else if (suggestion && solution) {
    content = (
      <>
        <p className="ai-panel__text">{solution}</p>
        {suggestion.missing_information.length > 0 ? (
          <div className="ai-panel__missing">
            <strong>Что уточнить</strong>
            <ul className="ai-panel__missing-list">
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
        <small className="ai-panel__note">
          Проверьте перед отправкой
          {sourcesNote(suggestion)}
        </small>
      </>
    );
  } else {
    content = (
      <>
        <p className="ai-panel__text">
          {ticket.ai_status === 'failed'
            ? 'Автоматическая классификация недоступна. Проверьте параметры вручную.'
            : 'Недостаточно данных для надёжной подсказки.'}
        </p>
        <span className="ai-panel__manual">Нужна проверка сотрудником</span>
      </>
    );
  }
  return (
    <div className="ai-panel">
      <div className="ai-panel__title">
        <span className="ai-panel__name">
          <Icon name="spark" size={18} />
          Помощник
        </span>
        <span className="ai-panel__private">Только команде</span>
      </div>
      {content}
    </div>
  );
}
