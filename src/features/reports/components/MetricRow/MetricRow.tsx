import { compare, formatValue, type Better, type MetricKind } from '@/features/reports/model/format';

import { Delta } from '../Delta/Delta';

import './MetricRow.scss';

export type MetricRowProps = {
    label: string;
    hint?: string;
    kind: MetricKind;
    current: number | null;
    previous?: number | null;
    better?: Better;
    note?: string;
};

export function MetricRow({ label, hint, kind, current, previous, better = 'none', note }: MetricRowProps) {
    const hasPrevious = previous !== undefined;

    return (
        <li className="metric-row">
            <span className="metric-row__label">
                {label}
                {hint ? <small className="metric-row__hint">{hint}</small> : null}
            </span>

            <span className="metric-row__value">{formatValue(kind, current)}</span>

            <span className="metric-row__compare">
                {hasPrevious ? (
                    <Delta delta={compare(kind, current, previous, better)} previous={formatValue(kind, previous)} />
                ) : (
                    <span className="metric-row__note">{note}</span>
                )}
            </span>
        </li>
    );
}
