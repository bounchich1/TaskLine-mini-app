import { clsx } from 'clsx';
import { useRef, type RefObject } from 'react';

import { useAnchoredPopover } from '@/shared/lib/use-anchored-popover';

import { Icon } from '../Icon/Icon';

import {
    dayLabel,
    dayOfMonth,
    inRange,
    monthGrid,
    monthTitle,
    parseDay,
    today,
    WEEKDAYS,
    type DayRange,
} from './calendar-model';
import { useCalendar } from './use-calendar';

type CalendarProps = {
    id: string;
    value: string;
    range: DayRange;
    anchor: RefObject<HTMLElement | null>;
    label: string | undefined;
    onChoose: (value: string) => void;
    onClose: () => void;
};

const WEEK = 7;

const weeksOf = (days: number[]) =>
    Array.from({ length: days.length / WEEK }, (_, index) => days.slice(index * WEEK, (index + 1) * WEEK));

export function Calendar({ id, value, range, anchor, label, onChoose, onClose }: CalendarProps) {
    const ref = useRef<HTMLDivElement>(null);

    useAnchoredPopover({ anchor, popover: ref, onClose });
    const calendar = useCalendar({ value, range, container: ref, onChoose });
    const selected = parseDay(value);
    const now = today();
    const month = new Date(calendar.month).getUTCMonth();
    const titleId = `${id}-title`;

    return (
        <div
            ref={ref}
            id={id}
            role="dialog"
            aria-label={label ?? 'Выбор даты'}
            popover="manual"
            tabIndex={-1}
            className="calendar"
        >
            <div className="calendar__head">
                <span id={titleId} className="calendar__title" aria-live="polite">
                    {monthTitle(calendar.month)}
                </span>

                <button
                    type="button"
                    className="calendar__nav"
                    aria-label="Предыдущий месяц"
                    disabled={!calendar.canPrevious}
                    onClick={() => {
                        calendar.showMonth(-1);
                    }}
                >
                    <Icon name="back" size={18} />
                </button>

                <button
                    type="button"
                    className="calendar__nav"
                    aria-label="Следующий месяц"
                    disabled={!calendar.canNext}
                    onClick={() => {
                        calendar.showMonth(1);
                    }}
                >
                    <Icon name="arrow" size={18} />
                </button>
            </div>

            <div role="grid" aria-labelledby={titleId} className="calendar__grid">
                <div role="row" className="calendar__row">
                    {WEEKDAYS.map((name) => (
                        <span role="columnheader" key={name} className="calendar__weekday">
                            {name}
                        </span>
                    ))}
                </div>

                {weeksOf(monthGrid(calendar.month)).map((week) => (
                    <div role="row" key={week[0]} className="calendar__row">
                        {week.map((day) => (
                            <span role="gridcell" key={day} aria-selected={day === selected}>
                                <button
                                    type="button"
                                    data-day={day}
                                    tabIndex={day === calendar.focus ? 0 : -1}
                                    aria-label={dayLabel(day)}
                                    aria-current={day === now ? 'date' : undefined}
                                    aria-disabled={inRange(day, range) ? undefined : true}
                                    className={clsx(
                                        'calendar__day',
                                        new Date(day).getUTCMonth() !== month && 'calendar__day--outside',
                                        day === now && 'calendar__day--today',
                                        day === selected && 'calendar__day--selected',
                                    )}
                                    onClick={() => {
                                        calendar.choose(day);
                                    }}
                                    onKeyDown={calendar.onKeyDown}
                                >
                                    {dayOfMonth(day)}
                                </button>
                            </span>
                        ))}
                    </div>
                ))}
            </div>

            <div className="calendar__foot">
                <button
                    type="button"
                    className="calendar__action"
                    disabled={!value}
                    onClick={() => {
                        onChoose('');
                    }}
                >
                    Очистить
                </button>

                <button
                    type="button"
                    className="calendar__action"
                    disabled={!inRange(now, range)}
                    onClick={() => {
                        calendar.choose(now);
                    }}
                >
                    Сегодня
                </button>
            </div>
        </div>
    );
}
