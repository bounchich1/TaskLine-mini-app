import { learningLabel } from '@/shared/config/labels';
import { formatDate } from '@/shared/lib/format-date';
import type { Closure } from '@/shared/types/api';
import { Icon } from '@/shared/ui';

import './ClosureHistory.scss';

function outcome(cycle: Closure) {
  if (cycle.rating) {
    return `${cycle.rating} / 10`;
  }
  if (cycle.finished_reason) {
    return 'Без оценки';
  }
  return cycle.invalidated ? 'Переоткрыто' : 'Ожидаем оценку';
}

function coverageNote(coverage: NonNullable<Closure['coverage']>) {
  return coverage.missing_attachments?.length
    ? `${coverage.missing_attachments.length} вложений без полного анализа`
    : 'Текстовая история учтена';
}

/** Every closure of the ticket: the client's rating and what the assistant learned from it. */
export function ClosureHistory({ closures, timezone }: { closures: Closure[]; timezone: string }) {
  return (
    <div className="closure-history">
      <span className="closure-history__label">ОЦЕНКИ И ОБУЧЕНИЕ</span>
      {closures.map((cycle) => (
        <div className="closure-history__item" key={cycle.id}>
          <div>
            <strong className="closure-history__rating">{outcome(cycle)}</strong>
            <small className="closure-history__meta">
              Закрытие {cycle.cycle_no} · {formatDate(cycle.closed_at, timezone, true)}
            </small>
          </div>
          <p className="closure-history__learning">
            <Icon name="spark" size={13} />
            {learningLabel(cycle.learning_status)}
          </p>
          {cycle.coverage ? (
            <small className="closure-history__meta">
              {cycle.coverage.message_count ?? 0} сообщений · {coverageNote(cycle.coverage)}
            </small>
          ) : null}
        </div>
      ))}
    </div>
  );
}
