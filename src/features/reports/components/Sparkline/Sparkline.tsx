import './Sparkline.scss';

const WIDTH = 96;
const HEIGHT = 24;

type SparklineProps = { values: number[]; label: string };

export function Sparkline({ values, label }: SparklineProps) {
    const max = Math.max(1, ...values);
    const step = values.length > 1 ? WIDTH / (values.length - 1) : 0;
    const points = values.map((value, index) => [index * step, HEIGHT - 2 - (value / max) * (HEIGHT - 4)] as const);
    const last = points.at(-1);

    return (
        <svg className="sparkline" width={WIDTH} height={HEIGHT} role="img" aria-label={label}>
            <polyline className="sparkline__line" points={points.map(([x, y]) => `${x},${y}`).join(' ')} />
            {last ? <circle className="sparkline__dot" cx={last[0]} cy={last[1]} r={2.5} /> : null}
        </svg>
    );
}
