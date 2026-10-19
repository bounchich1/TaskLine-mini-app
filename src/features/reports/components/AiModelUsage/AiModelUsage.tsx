import { formatCompact, formatDuration, formatMoney, formatPercent } from '@/features/reports/model/format';
import type { AiReport } from '@/features/reports/model/types';
import { diagnosticReasonLabel } from '@/shared/config/labels';

import { MetricGroup } from '../MetricGroup/MetricGroup';
import { MetricRow } from '../MetricRow/MetricRow';

import '../ReportTable/ReportTable.scss';
import './AiModelUsage.scss';

const KIND_LABELS: Record<string, string> = { triage: 'Разбор обращений', learning: 'Обучение на закрытых' };

type AiModelUsageProps = { report: AiReport };

export function AiModelUsage({ report }: AiModelUsageProps) {
    const { triage, calls, call_failures: callFailures, cost } = report;
    const failures = [...triage.failures, ...callFailures];

    return (
        <MetricGroup title="Работа модели" note={`разборов: ${triage.runs}`}>
            <MetricRow label="Разбор обращения" hint="медиана от создания" kind="duration" current={triage.p50} />
            <MetricRow label="Разбор обращения" hint="95 из 100 быстрее" kind="duration" current={triage.p95} />
            <MetricRow label="Успешных разборов" kind="share" current={triage.success_rate} />

            <li className="ai-model-usage__item">
                <span className="ai-model-usage__label">Стоимость</span>

                <span className="ai-model-usage__value">
                    {cost.amount === null ? 'цена не задана' : formatMoney(cost.amount, cost.currency)}
                </span>

                <small className="ai-model-usage__hint">
                    токенов: {formatCompact(cost.prompt_tokens)} на входе, {formatCompact(cost.completion_tokens)} на
                    выходе
                </small>
            </li>

            {calls.length ? (
                <li className="ai-model-usage__item ai-model-usage__item--table">
                    <table className="report-table ai-model-usage__table">
                        <thead>
                            <tr>
                                <th scope="col">Вызовы модели</th>
                                <th scope="col">Всего</th>
                                <th scope="col">Успешно</th>
                                <th scope="col">Медиана</th>
                                <th scope="col">95%</th>
                            </tr>
                        </thead>

                        <tbody>
                            {calls.map((call) => (
                                <tr key={call.kind}>
                                    <th scope="row" className="report-table__person">
                                        {KIND_LABELS[call.kind] ?? call.kind}
                                    </th>

                                    <td data-label="Всего">{formatCompact(call.calls)}</td>
                                    <td data-label="Успешно">{formatPercent(call.success_rate)}</td>
                                    <td data-label="Медиана">{formatDuration(call.p50)}</td>
                                    <td data-label="95%">{formatDuration(call.p95)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </li>
            ) : null}

            {failures.length ? (
                <li className="ai-model-usage__item ai-model-usage__item--failures">
                    <span className="ai-model-usage__label">Причины сбоев</span>

                    <ul className="ai-model-usage__failures">
                        {failures.map((failure) => (
                            <li key={failure.reason}>
                                {diagnosticReasonLabel(failure.reason)} — {failure.count}
                            </li>
                        ))}
                    </ul>
                </li>
            ) : null}
        </MetricGroup>
    );
}
