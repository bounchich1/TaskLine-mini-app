import { useEffect, useRef, useState, type KeyboardEvent, type RefObject } from 'react';

import {
    addDays,
    addMonths,
    clampDay,
    dayIso,
    inRange,
    monthStart,
    parseDay,
    today,
    weekday,
    type DayRange,
} from './calendar-model';

type Step = (day: number, shift: boolean) => number;

const STEPS: Partial<Record<string, Step>> = {
    ArrowLeft: (day) => addDays(day, -1),
    ArrowRight: (day) => addDays(day, 1),
    ArrowUp: (day) => addDays(day, -7),
    ArrowDown: (day) => addDays(day, 7),
    Home: (day) => addDays(day, -weekday(day)),
    End: (day) => addDays(day, 6 - weekday(day)),
    PageUp: (day, shift) => addMonths(day, shift ? -12 : -1),
    PageDown: (day, shift) => addMonths(day, shift ? 12 : 1),
};

type CalendarOptions = {
    value: string;
    range: DayRange;
    container: RefObject<HTMLElement | null>;
    onChoose: (value: string) => void;
};

export function useCalendar({ value, range, container, onChoose }: CalendarOptions) {
    const [focus, setFocus] = useState(() => clampDay(parseDay(value) ?? today(), range));
    const moveFocus = useRef(true);

    useEffect(() => {
        if (moveFocus.current) {
            moveFocus.current = false;
            container.current?.querySelector<HTMLElement>(`[data-day="${focus}"]`)?.focus();
        }
    }, [focus, container]);

    const month = monthStart(focus);

    return {
        focus,
        month,
        canPrevious: range.min === null || month > range.min,
        canNext: range.max === null || addMonths(month, 1) <= range.max,
        showMonth: (count: number) => {
            setFocus(addMonths(focus, count));
        },
        choose: (day: number) => {
            if (inRange(day, range)) {
                onChoose(dayIso(day));
            }
        },
        onKeyDown: (event: KeyboardEvent) => {
            const step = STEPS[event.key];

            if (step) {
                event.preventDefault();
                moveFocus.current = true;
                setFocus(step(focus, event.shiftKey));
            }
        },
    };
}
