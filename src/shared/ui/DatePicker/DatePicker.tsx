import { clsx } from 'clsx';
import { useId } from 'react';

import { usePopoverState } from '@/shared/lib/use-popover-state';

import { Icon } from '../Icon/Icon';

import { Calendar } from './Calendar';
import { formatDay, parseDay } from './calendar-model';

import './DatePicker.scss';

export type DatePickerProps = {
    value: string;
    onChange: (value: string) => void;
    min?: string;
    max?: string;
    placeholder?: string;
    className?: string;
    'aria-label'?: string;
};

export function DatePicker(props: DatePickerProps) {
    const { value, onChange, placeholder = 'Не выбрана' } = props;
    const label = props['aria-label'];
    const { open, root, trigger, close, toggle, onBlur } = usePopoverState();
    const calendarId = useId();

    return (
        <div ref={root} className={clsx('date-picker', props.className)} onBlur={onBlur}>
            <button
                ref={trigger}
                type="button"
                className="date-picker__trigger"
                aria-label={label}
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-controls={open ? calendarId : undefined}
                onClick={toggle}
            >
                <span className={clsx('date-picker__value', !value && 'date-picker__value--placeholder')}>
                    {value ? formatDay(value) : placeholder}
                </span>

                <Icon name="calendar" size={16} className="date-picker__icon" />
            </button>

            {open ? (
                <Calendar
                    id={calendarId}
                    value={value}
                    range={{ min: parseDay(props.min), max: parseDay(props.max) }}
                    anchor={root}
                    label={label}
                    onChoose={(next) => {
                        close();

                        if (next !== value) {
                            onChange(next);
                        }
                    }}
                    onClose={close}
                />
            ) : null}
        </div>
    );
}
