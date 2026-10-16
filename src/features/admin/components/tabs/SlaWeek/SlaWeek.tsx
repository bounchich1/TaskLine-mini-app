import { WEEKDAYS, type DayForm } from '@/features/admin/model/sla-form';
import { CheckboxField } from '@/shared/ui';

import { SlaTimeField } from '../SlaTimeField/SlaTimeField';

import './SlaWeek.scss';

type SlaWeekProps = {
    days: DayForm[];
    onChange: (days: DayForm[]) => void;
};

export function SlaWeek({ days, onChange }: SlaWeekProps) {
    const update = (index: number, patch: Partial<DayForm>) => {
        onChange(days.map((day, position) => (position === index ? { ...day, ...patch } : day)));
    };

    return (
        <div className="sla-week" role="table" aria-label="Рабочее время">
            <div className="sla-week__row sla-week__row--head" role="row">
                <span role="columnheader">День</span>
                <span role="columnheader">С</span>
                <span role="columnheader">До</span>
                <span role="columnheader">Перерыв с</span>
                <span role="columnheader">по</span>
            </div>

            {days.map((day, index) => {
                const name = WEEKDAYS[index] ?? '';
                const off = !day.works;

                return (
                    <div className="sla-week__row" role="row" key={name}>
                        <CheckboxField
                            name={`works-${index}`}
                            checked={day.works}
                            onChange={(works) => {
                                update(index, { works });
                            }}
                        >
                            {name}
                        </CheckboxField>

                        <SlaTimeField
                            label={`${name}: начало`}
                            value={day.from}
                            disabled={off}
                            required
                            onChange={(from) => {
                                update(index, { from });
                            }}
                        />

                        <SlaTimeField
                            label={`${name}: конец`}
                            value={day.to}
                            disabled={off}
                            required
                            onChange={(to) => {
                                update(index, { to });
                            }}
                        />

                        <SlaTimeField
                            label={`${name}: начало перерыва`}
                            value={day.breakFrom}
                            disabled={off}
                            onChange={(breakFrom) => {
                                update(index, { breakFrom });
                            }}
                        />

                        <SlaTimeField
                            label={`${name}: конец перерыва`}
                            value={day.breakTo}
                            disabled={off}
                            onChange={(breakTo) => {
                                update(index, { breakTo });
                            }}
                        />
                    </div>
                );
            })}
        </div>
    );
}
