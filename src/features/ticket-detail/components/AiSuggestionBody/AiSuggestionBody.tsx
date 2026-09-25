import { Button } from '@maxhub/max-ui';

import type { Suggestion, Ticket } from '@/shared/types/api';

type AiSuggestionBodyProps = {
  ticket: Ticket;
  canInsert: boolean;
  onInsert: (text: string) => void;
};

const sourcesNote = (suggestion: Suggestion) =>
  suggestion.evidence_memory_ids.length
    ? `Источников: ${suggestion.evidence_memory_ids.length}`
    : 'Без похожих обращений';

export function AiSuggestionBody({ ticket, canInsert, onInsert }: AiSuggestionBodyProps) {
  const { suggestion } = ticket;
  const solution = suggestion?.suggested_solution;
  if (ticket.ai_status === 'pending') {
    return (
      <p className="ai-panel__status">Разбирает первое сообщение. Отвечать можно не дожидаясь.</p>
    );
  }
  if (ticket.suggestion_stale) {
    return <p className="ai-panel__status">Подсказка устарела после изменений в обращении.</p>;
  }
  if (!suggestion || !solution) {
    return (
      <p className="ai-panel__status ai-panel__status--review">
        {ticket.ai_status === 'failed'
          ? 'Классификация не удалась — проверьте тег, срочность и сложность вручную.'
          : 'Недостаточно данных для подсказки — проверьте классификацию вручную.'}
      </p>
    );
  }
  return (
    <>
      <p className="ai-panel__text">{solution}</p>
      {suggestion.missing_information.length > 0 ? (
        <div className="ai-panel__missing">
          <span className="ai-panel__missing-title">Уточнить у клиента</span>
          <ul className="ai-panel__missing-list">
            {suggestion.missing_information.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="ai-panel__footer">
        <Button
          variant="secondary"
          size="xsmall"
          disabled={!canInsert}
          onClick={() => {
            onInsert(solution);
          }}
        >
          Вставить в черновик
        </Button>
        <small className="ai-panel__sources">{sourcesNote(suggestion)}</small>
      </div>
    </>
  );
}
