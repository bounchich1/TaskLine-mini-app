import { formatPercent } from '@/features/reports/model/format';

import './ShareMeter.scss';

type ShareMeterProps = { label: string; value: number | null; hint?: string };

export function ShareMeter({ label, value, hint }: ShareMeterProps) {
    return (
        <li className="share-meter">
            <span className="share-meter__label">
                {label}
                {hint ? <small className="share-meter__hint">{hint}</small> : null}
            </span>

            <span
                className="share-meter__track"
                role="meter"
                aria-label={label}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={value === null ? undefined : Math.round(value * 100)}
            >
                <span className="share-meter__fill" style={{ width: `${Math.round((value ?? 0) * 100)}%` }} />
            </span>

            <span className="share-meter__value">{formatPercent(value)}</span>
        </li>
    );
}
