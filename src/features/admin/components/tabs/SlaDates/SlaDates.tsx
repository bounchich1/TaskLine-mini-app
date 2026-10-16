import { mergeDates } from '@/features/admin/model/sla-form';
import { formatDate } from '@/shared/lib/format-date';
import { DatePicker, Icon } from '@/shared/ui';

import './SlaDates.scss';

type SlaDatesProps = {
    label: string;
    dates: string[];
    onChange: (dates: string[]) => void;
};

export function SlaDates({ label, dates, onChange }: SlaDatesProps) {
    return (
        <div className="sla-dates">
            <DatePicker
                className="sla-dates__picker"
                value=""
                placeholder="Добавить дату"
                aria-label={label}
                onChange={(date) => {
                    if (date) {
                        onChange(mergeDates(dates, [date]));
                    }
                }}
            />

            {dates.length ? (
                <ul className="sla-dates__list" aria-label={label}>
                    {dates.map((date) => (
                        <li className="sla-dates__item" key={date}>
                            <span>{`${formatDate(`${date}T12:00:00Z`, 'UTC', true)} ${date.slice(0, 4)}`}</span>

                            <button
                                type="button"
                                className="sla-dates__remove"
                                aria-label={`Убрать ${date}`}
                                onClick={() => {
                                    onChange(dates.filter((item) => item !== date));
                                }}
                            >
                                <Icon name="close" size={12} />
                            </button>
                        </li>
                    ))}
                </ul>
            ) : null}
        </div>
    );
}
