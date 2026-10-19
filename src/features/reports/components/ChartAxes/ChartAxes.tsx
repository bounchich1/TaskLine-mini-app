import { labelIndexes, ticks, type Plot } from '@/features/reports/model/chart';
import { formatCompact, formatDay } from '@/features/reports/model/format';

type ChartAxesProps = { plot: Plot; max: number; days: string[]; bandCenter: (index: number) => number };

export function ChartAxes({ plot, max, days, bandCenter }: ChartAxesProps) {
    return (
        <g className="report-chart__axes" aria-hidden>
            {ticks(max).map((tick) => (
                <g key={tick}>
                    <line
                        className="report-chart__grid"
                        x1={plot.x0}
                        x2={plot.x0 + plot.width}
                        y1={plot.scaleY(tick)}
                        y2={plot.scaleY(tick)}
                    />

                    <text className="report-chart__tick" x={plot.x0 - 8} y={plot.scaleY(tick)} dy="0.32em">
                        {formatCompact(Math.round(tick))}
                    </text>
                </g>
            ))}

            {labelIndexes(days.length, Math.max(2, Math.floor(plot.width / 64))).map((index) => (
                <text key={index} className="report-chart__day" x={bandCenter(index)} y={plot.y0 + 16}>
                    {formatDay(days[index] ?? '')}
                </text>
            ))}
        </g>
    );
}
