const DAY_MS = 86_400_000;
const GRID_DAYS = 42;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const;

const monthName = new Intl.DateTimeFormat('ru-RU', { month: 'long', timeZone: 'UTC' });

const fullDate = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
});

export function parseDay(iso: string | undefined): number | null {
    const match = iso ? ISO_DATE.exec(iso) : null;

    return match ? Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
}

export const dayIso = (day: number) => new Date(day).toISOString().slice(0, 10);

export function today(): number {
    const now = new Date();

    return Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
}

export const weekday = (day: number) => (new Date(day).getUTCDay() + 6) % 7;

export const addDays = (day: number, count: number) => day + count * DAY_MS;

export function addMonths(day: number, count: number): number {
    const date = new Date(day);
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + count;
    const last = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

    return Date.UTC(year, month, Math.min(date.getUTCDate(), last));
}

export function monthStart(day: number): number {
    const date = new Date(day);

    return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1);
}

export function monthGrid(month: number): number[] {
    const first = addDays(month, -weekday(month));

    return Array.from({ length: GRID_DAYS }, (_, index) => addDays(first, index));
}

export function monthTitle(month: number): string {
    const name = monthName.format(month);

    return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${new Date(month).getUTCFullYear()}`;
}

export const dayLabel = (day: number) => fullDate.format(day);

export const dayOfMonth = (day: number) => new Date(day).getUTCDate();

export function formatDay(iso: string): string {
    const match = ISO_DATE.exec(iso);

    return match ? `${match[3]}.${match[2]}.${match[1]}` : iso;
}

export type DayRange = { min: number | null; max: number | null };

export const inRange = (day: number, { min, max }: DayRange) =>
    (min === null || day >= min) && (max === null || day <= max);

export function clampDay(day: number, { min, max }: DayRange): number {
    if (min !== null && day < min) {
        return min;
    }

    return max !== null && day > max ? max : day;
}
