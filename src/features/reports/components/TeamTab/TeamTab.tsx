import { clsx } from 'clsx';

import {
    EMPTY,
    formatCount,
    formatDuration,
    formatHours,
    formatPercent,
    formatScore,
} from '@/features/reports/model/format';
import type { TeamReport, TeamRow } from '@/features/reports/model/types';
import { roleLabel } from '@/shared/config/labels';
import { Empty } from '@/shared/ui';

import '../ReportTable/ReportTable.scss';
import './TeamTab.scss';

const PRESENCE = { online: 'На линии', break: 'Перерыв', offline: 'Не в сети' } as const;

type Column = { label: string; hint?: string; value: (row: TeamRow) => string };

const COLUMNS: Column[] = [
    { label: 'В работе', hint: 'сейчас / лимит', value: (row) => `${row.active} / ${row.capacity}` },
    { label: 'Взято', value: (row) => formatCount(row.taken) },
    { label: 'Закрыто', value: (row) => formatCount(row.closed) },
    { label: 'Первый ответ', hint: 'медиана', value: (row) => formatDuration(row.response_p50) },
    { label: 'Решение', hint: 'медиана', value: (row) => formatDuration(row.resolution_p50) },
    { label: 'Оценка', value: (row) => (row.csat === null ? EMPTY : `${formatScore(row.csat)} · ${row.rated}`) },
    { label: 'Переоткрыто', value: (row) => formatPercent(row.reopen_rate) },
    { label: 'Передал', value: (row) => formatCount(row.transfers_out) },
    { label: 'На линии', value: (row) => formatHours(row.online_seconds) },
    { label: 'Черновик ИИ', hint: 'доля ответов', value: (row) => formatPercent(row.ai_draft_share) },
];

type TeamTabProps = { report: TeamReport };

export function TeamTab({ report }: TeamTabProps) {
    if (!report.items.length) {
        return (
            <Empty title="Нет сотрудников">Показатели появятся, когда сотрудники начнут работать с обращениями.</Empty>
        );
    }

    return (
        <div className="team-tab">
            <p className="team-tab__note">
                Порядок — по текущей нагрузке. Медианы, оценки и доля переоткрытых скрыты, если обращений меньше{' '}
                {report.min_sample}.{report.business_hours ? ' Время — в рабочих часах.' : ''}
            </p>

            <div className="report-table-scroll">
                <table className="report-table">
                    <thead>
                        <tr>
                            <th scope="col">Сотрудник</th>

                            {COLUMNS.map((column) => (
                                <th key={column.label} scope="col">
                                    {column.label}
                                    {column.hint ? <small className="report-table__hint">{column.hint}</small> : null}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {report.items.map((row) => (
                            <tr key={row.employee_id} className={clsx(row.blocked && 'report-table__row--blocked')}>
                                <th scope="row" className="report-table__person">
                                    <span className="report-table__name">
                                        <i
                                            className={clsx(
                                                'report-table__presence',
                                                `report-table__presence--${row.presence}`,
                                            )}
                                        />

                                        {row.name}
                                    </span>

                                    <small className="report-table__role">
                                        {row.blocked
                                            ? 'Заблокирован'
                                            : `${roleLabel(row.role)} · ${PRESENCE[row.presence]}`}
                                    </small>
                                </th>

                                {COLUMNS.map((column) => (
                                    <td key={column.label} data-label={column.label}>
                                        {column.value(row)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
