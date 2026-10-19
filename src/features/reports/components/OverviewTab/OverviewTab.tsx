import type { OverviewMetrics, OverviewReport } from '@/features/reports/model/types';

import { BacklogChart } from '../BacklogChart/BacklogChart';
import { FlowChart } from '../FlowChart/FlowChart';
import { MetricGroup } from '../MetricGroup/MetricGroup';
import { MetricRow, type MetricRowProps } from '../MetricRow/MetricRow';

import './OverviewTab.scss';

type Row = Omit<MetricRowProps, 'current' | 'previous'> & { key: keyof OverviewMetrics };

const FLOW: Row[] = [
    { key: 'created', label: 'Новых обращений', kind: 'count' },
    { key: 'closed', label: 'Закрыто', kind: 'count', better: 'up' },
    { key: 'open_end', label: 'Открыто на конец периода', kind: 'count', better: 'down' },
    { key: 'assignment_p50', label: 'Ожидание исполнителя', hint: 'медиана', kind: 'duration', better: 'down' },
];

const SPEED: Row[] = [
    { key: 'response_p50', label: 'Первый ответ', hint: 'медиана', kind: 'duration', better: 'down' },
    { key: 'response_p90', label: 'Первый ответ', hint: '9 из 10 обращений быстрее', kind: 'duration', better: 'down' },
    { key: 'resolution_p50', label: 'Решение', hint: 'медиана', kind: 'duration', better: 'down' },
    { key: 'resolution_p90', label: 'Решение', hint: '9 из 10 обращений быстрее', kind: 'duration', better: 'down' },
];

const QUALITY: Row[] = [
    { key: 'csat', label: 'Средняя оценка', hint: 'из 10', kind: 'score', better: 'up' },
    { key: 'promoters', label: 'Оценили на 9–10', kind: 'share', better: 'up' },
    { key: 'detractors', label: 'Оценили на 1–6', kind: 'share', better: 'down' },
    { key: 'rating_response', label: 'Ответили на запрос оценки', kind: 'share', better: 'up' },
    { key: 'reopen_rate', label: 'Переоткрыты за 7 дней', kind: 'share', better: 'down' },
];

const SLA: Row[] = [
    { key: 'sla_response', label: 'Первый ответ в срок', kind: 'share', better: 'up' },
    { key: 'sla_resolution', label: 'Решено в срок', kind: 'share', better: 'up' },
];

type OverviewTabProps = { report: OverviewReport };

export function OverviewTab({ report }: OverviewTabProps) {
    const rows = (list: Row[]) =>
        list.map(({ key, ...row }) => (
            <MetricRow
                key={`${key}-${row.hint ?? ''}`}
                {...row}
                current={report.current[key]}
                previous={report.previous[key]}
            />
        ));

    return (
        <div className="overview-tab">
            <div className="overview-tab__charts">
                <FlowChart points={report.trend} />
                <BacklogChart points={report.trend} />
            </div>

            <div className="overview-tab__groups">
                <MetricGroup title="Поток обращений">{rows(FLOW)}</MetricGroup>

                <MetricGroup title="Скорость" note={report.business_hours ? 'в рабочих часах' : 'календарное время'}>
                    {rows(SPEED)}
                </MetricGroup>

                <MetricGroup title="Оценки клиентов" note={`оценок: ${report.current.rated}`}>
                    {rows(QUALITY)}
                </MetricGroup>

                <MetricGroup title="SLA">{rows(SLA)}</MetricGroup>
            </div>
        </div>
    );
}
