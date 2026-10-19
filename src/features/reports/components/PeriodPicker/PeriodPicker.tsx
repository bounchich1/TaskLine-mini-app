import { clsx } from 'clsx';

import { customRange, PRESETS, presetRange, type ReportRange } from '@/features/reports/model/period';
import { DatePicker } from '@/shared/ui';

import './PeriodPicker.scss';

type PeriodPickerProps = {
    range: ReportRange;
    timezone: string;
    today: string;
    onChange: (range: ReportRange) => void;
};

export function PeriodPicker({ range, timezone, today, onChange }: PeriodPickerProps) {
    return (
        <div className="period-picker" role="group" aria-label="Период отчёта">
            <div className="period-picker__presets">
                {PRESETS.map(({ preset, label }) => (
                    <button
                        key={preset}
                        type="button"
                        className={clsx(
                            'period-picker__preset',
                            range.preset === preset && 'period-picker__preset--active',
                        )}
                        aria-pressed={range.preset === preset}
                        onClick={() => {
                            onChange(presetRange(preset, timezone));
                        }}
                    >
                        {label}
                    </button>
                ))}

                <button
                    type="button"
                    className={clsx(
                        'period-picker__preset',
                        range.preset === 'custom' && 'period-picker__preset--active',
                    )}
                    aria-pressed={range.preset === 'custom'}
                    onClick={() => {
                        onChange(customRange(range.from, range.to));
                    }}
                >
                    Период
                </button>
            </div>

            {range.preset === 'custom' ? (
                <div className="period-picker__custom">
                    <DatePicker
                        aria-label="Начало периода"
                        value={range.from}
                        max={today}
                        onChange={(from) => {
                            onChange(customRange(from, range.to));
                        }}
                    />

                    <span className="period-picker__dash">—</span>

                    <DatePicker
                        aria-label="Конец периода"
                        value={range.to}
                        max={today}
                        onChange={(to) => {
                            onChange(customRange(range.from, to));
                        }}
                    />
                </div>
            ) : null}
        </div>
    );
}
