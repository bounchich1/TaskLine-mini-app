import { dayKey } from '@/shared/lib/format-date';

export type PeriodPreset = 'today' | 'week' | 'month' | 'custom';

export type ReportRange = { preset: PeriodPreset; from: string; to: string };

export const PRESETS: readonly { preset: Exclude<PeriodPreset, 'custom'>; label: string; days: number }[] = [
    { preset: 'today', label: 'Сегодня', days: 1 },
    { preset: 'week', label: '7 дней', days: 7 },
    { preset: 'month', label: '30 дней', days: 30 },
];

const MAX_DAYS = 366;

function shiftDay(day: string, days: number): string {
    const date = new Date(`${day}T00:00:00Z`);

    date.setUTCDate(date.getUTCDate() + days);

    return date.toISOString().slice(0, 10);
}

export function presetRange(preset: Exclude<PeriodPreset, 'custom'>, timezone: string, now = Date.now()): ReportRange {
    const today = dayKey(now, timezone);
    const days = PRESETS.find((item) => item.preset === preset)?.days ?? 1;

    return { preset, from: shiftDay(today, 1 - days), to: today };
}

export function customRange(from: string, to: string): ReportRange {
    const [start, end] = from <= to ? [from, to] : [to, from];
    const longest = shiftDay(end, 1 - MAX_DAYS);

    return { preset: 'custom', from: start < longest ? longest : start, to: end };
}
