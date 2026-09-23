import { learningLabel } from '@/shared/config/labels';
import { formatDate } from '@/shared/lib/format-date';
import type { Closure } from '@/shared/types/api';
import { Icon } from '@/shared/ui';

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
    <div className="property-box">
      <span className="section-label">ОЦЕНКИ И ОБУЧЕНИЕ</span>
      {closures.map((cycle) => (
        <div className="closure" key={cycle.id}>
          <div>
            <strong>{outcome(cycle)}</strong>
            <small>
              Закрытие {cycle.cycle_no} · {formatDate(cycle.closed_at, timezone, true)}
            </small>
          </div>
          <p>
            <Icon name="spark" size={13} />
            {learningLabel(cycle.learning_status)}
          </p>
          {cycle.coverage ? (
            <small>
              {cycle.coverage.message_count ?? 0} сообщений · {coverageNote(cycle.coverage)}
            </small>
          ) : null}
        </div>
      ))}
    </div>
  );
}
