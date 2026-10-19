import { useReportExport, type ExportFormat } from '@/features/reports/hooks/use-report-export';
import type { ReportRange } from '@/features/reports/model/period';
import type { ReportName } from '@/features/reports/model/types';
import { ErrorNotice } from '@/shared/ui';

import './ExportButtons.scss';

const FORMATS: readonly { format: ExportFormat; label: string }[] = [
    { format: 'csv', label: 'CSV' },
    { format: 'xlsx', label: 'Excel' },
];

type ExportButtonsProps = { name: ReportName; range: ReportRange };

export function ExportButtons({ name, range }: ExportButtonsProps) {
    const exporter = useReportExport(name, range);

    const label = (format: ExportFormat, text: string) => {
        if (exporter.busy === format) {
            return '…';
        }

        return exporter.needsGrant(format) ? text : `Скачать ${text}`;
    };

    return (
        <div className="export-buttons">
            <div className="export-buttons__row" role="group" aria-label="Выгрузить таблицу">
                <span className="export-buttons__label">Выгрузить</span>

                {FORMATS.map(({ format, label: text }) => (
                    <button
                        key={format}
                        type="button"
                        className="export-buttons__button"
                        disabled={exporter.busy !== null}
                        onClick={() => {
                            exporter.download(format);
                        }}
                    >
                        {label(format, text)}
                    </button>
                ))}
            </div>

            <ErrorNotice error={exporter.error} />
        </div>
    );
}
