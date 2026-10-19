import type { QualityReport } from '@/features/reports/model/types';
import { formatDate } from '@/shared/lib/format-date';
import { Empty } from '@/shared/ui';

import '../ReportTable/ReportTable.scss';
import './QualityTab.scss';

type QualityTabProps = { report: QualityReport; onTicket: (id: string) => void };

export function QualityTab({ report, onTicket }: QualityTabProps) {
    if (!report.items.length) {
        return <Empty title="Низких оценок нет">За период нет обращений с оценкой {report.threshold} и ниже.</Empty>;
    }

    return (
        <div className="quality-tab">
            <p className="quality-tab__note">
                Обращения с оценкой {report.threshold} и ниже — с ними стоит разобраться в первую очередь.
            </p>

            <div className="report-table-scroll">
                <table className="report-table quality-table">
                    <thead>
                        <tr>
                            <th scope="col">Обращение</th>

                            <th scope="col" className="report-table__text">
                                Тема
                            </th>

                            <th scope="col" className="report-table__text">
                                Сотрудник
                            </th>

                            <th scope="col">Оценка</th>
                            <th scope="col">Закрыто</th>
                        </tr>
                    </thead>

                    <tbody>
                        {report.items.map((row) => (
                            <tr key={`${row.ticket_id}-${row.lifecycle}`}>
                                <th scope="row" className="report-table__person">
                                    <button
                                        type="button"
                                        className="quality-table__link"
                                        onClick={() => {
                                            onTicket(row.ticket_id);
                                        }}
                                    >
                                        №{row.number}
                                    </button>

                                    {row.purged ? <small className="report-table__role">данные удалены</small> : null}
                                </th>

                                <td data-label="Тема" className="report-table__text">
                                    {row.tag_label}
                                </td>

                                <td data-label="Сотрудник" className="report-table__text">
                                    {row.assignee_name ?? '—'}
                                </td>

                                <td data-label="Оценка">
                                    <span className="quality-table__rating">{row.rating}</span>
                                </td>

                                <td data-label="Закрыто">{formatDate(row.closed_at, report.period.timezone)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
