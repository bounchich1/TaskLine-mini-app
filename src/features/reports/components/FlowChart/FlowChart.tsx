import { useState } from 'react';

import { useElementWidth } from '@/features/reports/hooks/use-element-width';
import { CHART_HEIGHT, niceMax, plotArea, topRoundedBar } from '@/features/reports/model/chart';
import { formatCount, formatDay } from '@/features/reports/model/format';
import type { TrendPoint } from '@/features/reports/model/types';

import { ChartAxes } from '../ChartAxes/ChartAxes';
import { ChartTooltip } from '../ChartTooltip/ChartTooltip';

import '../ReportChart/ReportChart.scss';

const BAR_MAX = 12;
const GAP = 2;

type FlowChartProps = { points: TrendPoint[] };

export function FlowChart({ points }: FlowChartProps) {
    const { ref, width } = useElementWidth<HTMLDivElement>();
    const [active, setActive] = useState<number | null>(null);
    const max = niceMax(Math.max(0, ...points.map((point) => Math.max(point.created, point.closed))));
    const plot = plotArea(width, max);
    const band = points.length ? plot.width / points.length : 0;
    const bar = Math.max(1, Math.min(BAR_MAX, (band - GAP * 3) / 2));
    const center = (index: number) => plot.x0 + band * index + band / 2;
    const current = active === null ? null : points[active];

    return (
        <figure className="report-chart">
            <figcaption className="report-chart__header">
                <span className="report-chart__title">Новые и закрытые по дням</span>

                <span className="report-chart__legend">
                    <span className="report-chart__legend-item">
                        <i className="report-chart__swatch report-chart__swatch--primary" aria-hidden />
                        Новые
                    </span>

                    <span className="report-chart__legend-item">
                        <i className="report-chart__swatch report-chart__swatch--secondary" aria-hidden />
                        Закрытые
                    </span>
                </span>
            </figcaption>

            <div
                ref={ref}
                className="report-chart__canvas"
                onPointerLeave={() => {
                    setActive(null);
                }}
            >
                {width > 0 ? (
                    <svg width={width} height={CHART_HEIGHT} role="img" aria-label="Новые и закрытые обращения по дням">
                        <ChartAxes plot={plot} max={max} days={points.map((point) => point.day)} bandCenter={center} />

                        {points.map((point, index) => (
                            <g key={point.day} className={active === index ? 'report-chart__band--active' : undefined}>
                                <path
                                    className="report-chart__bar report-chart__bar--primary"
                                    d={topRoundedBar(
                                        center(index) - bar - GAP / 2,
                                        plot.scaleY(point.created),
                                        bar,
                                        plot.y0 - plot.scaleY(point.created),
                                    )}
                                />

                                <path
                                    className="report-chart__bar report-chart__bar--secondary"
                                    d={topRoundedBar(
                                        center(index) + GAP / 2,
                                        plot.scaleY(point.closed),
                                        bar,
                                        plot.y0 - plot.scaleY(point.closed),
                                    )}
                                />

                                <rect
                                    className="report-chart__hit"
                                    x={plot.x0 + band * index}
                                    y={plot.y0 - plot.height}
                                    width={band}
                                    height={plot.height}
                                    onPointerEnter={() => {
                                        setActive(index);
                                    }}
                                />
                            </g>
                        ))}
                    </svg>
                ) : null}

                {current && active !== null ? (
                    <ChartTooltip
                        title={formatDay(current.day)}
                        x={center(active)}
                        width={width}
                        rows={[
                            { label: 'новых', value: formatCount(current.created), series: 'primary' },
                            { label: 'закрыто', value: formatCount(current.closed), series: 'secondary' },
                        ]}
                    />
                ) : null}
            </div>
        </figure>
    );
}
