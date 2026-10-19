import { compare, formatCount, formatDuration, formatScore } from '@/features/reports/model/format';
import type { TopicRow, TopicsReport } from '@/features/reports/model/types';
import { Empty } from '@/shared/ui';

import { Delta } from '../Delta/Delta';
import { Sparkline } from '../Sparkline/Sparkline';

import '../ReportTable/ReportTable.scss';
import './TopicsTab.scss';

function growthLabel(row: TopicRow): string {
    if (row.previous === 0) {
        return row.created ? 'новая' : '—';
    }

    return '';
}

type TopicsTabProps = { report: TopicsReport };

export function TopicsTab({ report }: TopicsTabProps) {
    const growing = report.fastest_growing
        .map((code) => report.items.find((item) => item.code === code))
        .filter((item): item is TopicRow => item !== undefined);

    if (!report.items.length) {
        return <Empty title="Тем пока нет" />;
    }

    const rows = [...report.items].sort((left, right) => right.created - left.created || right.closed - left.closed);

    return (
        <div className="topics-tab">
            {growing.length ? (
                <section className="topics-tab__growing" aria-label="Быстрее всего растут">
                    <h2 className="topics-tab__title">Быстрее всего растут</h2>

                    <ul className="topics-tab__growing-list">
                        {growing.map((item) => (
                            <li key={item.code} className="topics-tab__growing-item">
                                <span>{item.label}</span>
                                <strong>{formatCount(item.created)}</strong>
                                <span className="topics-tab__muted">было {formatCount(item.previous)}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            ) : null}

            <div className="report-table-scroll">
                <table className="report-table topics-table">
                    <thead>
                        <tr>
                            <th scope="col">Тема</th>
                            <th scope="col">По дням</th>
                            <th scope="col">Новых</th>
                            <th scope="col">К прошлому периоду</th>
                            <th scope="col">Закрыто</th>

                            <th scope="col">
                                Решение
                                <small className="report-table__hint">медиана</small>
                            </th>

                            <th scope="col">Оценка</th>
                        </tr>
                    </thead>

                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.code}>
                                <th scope="row" className="report-table__person">
                                    {row.label}
                                    {row.active ? null : <small className="report-table__role">в архиве</small>}
                                </th>

                                <td data-label="По дням">
                                    <Sparkline values={row.series} label={`${row.label}: новые по дням`} />
                                </td>

                                <td data-label="Новых">{formatCount(row.created)}</td>

                                <td data-label="К прошлому периоду">
                                    {growthLabel(row) || (
                                        <Delta
                                            delta={compare('count', row.created, row.previous, 'none')}
                                            previous={formatCount(row.previous)}
                                        />
                                    )}
                                </td>

                                <td data-label="Закрыто">{formatCount(row.closed)}</td>
                                <td data-label="Решение">{formatDuration(row.resolution_p50)}</td>
                                <td data-label="Оценка">{formatScore(row.csat)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
