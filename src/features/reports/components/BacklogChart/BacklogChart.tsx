import { useState } from 'react';

import { useElementWidth } from '@/features/reports/hooks/use-element-width';
import { CHART_HEIGHT, linePaths, niceMax, plotArea, type Point } from '@/features/reports/model/chart';
import { formatCount, formatDay } from '@/features/reports/model/format';
import type { TrendPoint } from '@/features/reports/model/types';

import { ChartAxes } from '../ChartAxes/ChartAxes';
import { ChartTooltip } from '../ChartTooltip/ChartTooltip';

import '../ReportChart/ReportChart.scss';

type BacklogChartProps = { points: TrendPoint[] };

export function BacklogChart({ points }: BacklogChartProps) {
    const { ref, width } = useElementWidth<HTMLDivElement>();
    const [active, setActive] = useState<number | null>(null);
    const max = niceMax(Math.max(0, ...points.map((point) => point.open_end)));
    const plot = plotArea(width, max);
    const band = points.length ? plot.width / points.length : 0;
    const center = (index: number) => plot.x0 + band * index + band / 2;
    const coordinates: Point[] = points.map((point, index) => [center(index), plot.scaleY(point.open_end)]);
    const { line, area } = linePaths(coordinates, plot.y0);
    const index = active ?? points.length - 1;
    const marker = coordinates.at(index);
    const point = points.at(index);

    return (
        <figure className="report-chart">
            <figcaption className="report-chart__header">
                <span className="report-chart__title">Открыто на конец дня</span>
                <span className="report-chart__value">{formatCount(points.at(-1)?.open_end ?? 0)}</span>
            </figcaption>

            <div
                ref={ref}
                className="report-chart__canvas"
                onPointerLeave={() => {
                    setActive(null);
                }}
            >
                {width > 0 ? (
                    <svg width={width} height={CHART_HEIGHT} role="img" aria-label="Открытые обращения на конец дня">
                        <ChartAxes plot={plot} max={max} days={points.map((item) => item.day)} bandCenter={center} />
                        <path className="report-chart__area" d={area} />
                        <path className="report-chart__line" d={line} />

                        {active !== null && marker ? (
                            <line
                                className="report-chart__crosshair"
                                x1={marker[0]}
                                x2={marker[0]}
                                y1={plot.y0 - plot.height}
                                y2={plot.y0}
                            />
                        ) : null}

                        {marker ? <circle className="report-chart__dot" cx={marker[0]} cy={marker[1]} r={4} /> : null}

                        {points.map((item, position) => (
                            <rect
                                key={item.day}
                                className="report-chart__hit"
                                x={plot.x0 + band * position}
                                y={plot.y0 - plot.height}
                                width={band}
                                height={plot.height}
                                onPointerEnter={() => {
                                    setActive(position);
                                }}
                            />
                        ))}
                    </svg>
                ) : null}

                {active !== null && point && marker ? (
                    <ChartTooltip
                        title={formatDay(point.day)}
                        x={marker[0]}
                        width={width}
                        rows={[{ label: 'открыто', value: formatCount(point.open_end), series: 'primary' }]}
                    />
                ) : null}
            </div>
        </figure>
    );
}
