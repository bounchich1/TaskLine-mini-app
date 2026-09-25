import { clsx } from 'clsx';

import { learningLabel } from '@/shared/config/labels';
import { formatDate } from '@/shared/lib/format-date';
import type { Closure } from '@/shared/types/api';

import './ClosureHistory.scss';

function outcome(cycle: Closure) {
    if (cycle.rating) {
        return `${cycle.rating} / 10`;
    }

    if (cycle.finished_reason) {
        return 'Без оценки';
    }

    return cycle.invalidated ? 'Переоткрыто' : 'Ожидается';
}

function coverageNote(coverage: NonNullable<Closure['coverage']>) {
    const messages = `${coverage.message_count ?? 0} сообщений`;

    return coverage.missing_attachments?.length
        ? `${messages}, ${coverage.missing_attachments.length} вложений без анализа`
        : `${messages}, текст учтён полностью`;
}

export function ClosureHistory({ closures, timezone }: { closures: Closure[]; timezone: string }) {
    const cycles = [...closures].sort((left, right) => right.cycle_no - left.cycle_no);

    return (
        <div className="closures">
            <h3 className="closures__title">Оценка клиента</h3>

            <ol className="closures__list">
                {cycles.map((cycle) => (
                    <li className="closures__item" key={cycle.id}>
                        <div className="closures__head">
                            <strong className={clsx('closures__rating', !cycle.rating && 'closures__rating--none')}>
                                {outcome(cycle)}
                            </strong>

                            <small className="closures__meta">
                                {cycle.rated_at ? `получена ${formatDate(cycle.rated_at, timezone)}` : null}
                            </small>
                        </div>

                        <small className="closures__meta">
                            Закрытие {cycle.cycle_no} · {formatDate(cycle.closed_at, timezone)}
                        </small>

                        <small className="closures__meta">
                            Обучение: {learningLabel(cycle.learning_status)}
                            {cycle.coverage ? ` · ${coverageNote(cycle.coverage)}` : null}
                        </small>
                    </li>
                ))}
            </ol>
        </div>
    );
}
