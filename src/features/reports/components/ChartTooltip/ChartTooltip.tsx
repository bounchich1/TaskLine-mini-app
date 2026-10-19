import { clsx } from 'clsx';

type TooltipRow = { label: string; value: string; series: 'primary' | 'secondary' };

type ChartTooltipProps = { title: string; rows: TooltipRow[]; x: number; width: number };

const TOOLTIP_WIDTH = 150;

export function ChartTooltip({ title, rows, x, width }: ChartTooltipProps) {
    const left = Math.min(Math.max(0, x - TOOLTIP_WIDTH / 2), Math.max(0, width - TOOLTIP_WIDTH));

    return (
        <div className="report-chart__tooltip" style={{ left, width: TOOLTIP_WIDTH }} role="status">
            <span className="report-chart__tooltip-title">{title}</span>

            {rows.map((row) => (
                <span key={row.label} className="report-chart__tooltip-row">
                    <i className={clsx('report-chart__key', `report-chart__key--${row.series}`)} aria-hidden />
                    <strong className="report-chart__tooltip-value">{row.value}</strong>
                    <span className="report-chart__tooltip-label">{row.label}</span>
                </span>
            ))}
        </div>
    );
}
