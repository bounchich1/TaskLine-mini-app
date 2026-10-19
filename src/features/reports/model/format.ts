const number = new Intl.NumberFormat('ru-RU');
const decimal = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const money = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const compact = new Intl.NumberFormat('ru-RU', { notation: 'compact', maximumFractionDigits: 1 });

export const EMPTY = '—';

export function formatCount(value: number | null | undefined): string {
    return value === null || value === undefined ? EMPTY : number.format(value);
}

export function formatCompact(value: number): string {
    return value < 10000 ? number.format(value) : compact.format(value);
}

export function formatScore(value: number | null): string {
    return value === null ? EMPTY : decimal.format(value);
}

export function formatMoney(value: number | null, currency: string): string {
    return value === null ? EMPTY : `${money.format(value)} ${currency}`;
}

export function formatPercent(value: number | null): string {
    return value === null ? EMPTY : `${Math.round(value * 100)}%`;
}

export function formatDuration(seconds: number | null): string {
    if (seconds === null) {
        return EMPTY;
    }

    const minutes = Math.round(seconds / 60);

    if (minutes < 1) {
        return seconds < 1 ? '<1 с' : `${Math.round(seconds)} с`;
    }

    if (minutes < 60) {
        return `${minutes} мин`;
    }

    if (minutes < 48 * 60) {
        return `${Math.floor(minutes / 60)} ч ${String(minutes % 60).padStart(2, '0')} мин`;
    }

    return `${decimal.format(minutes / 1440)} дн`;
}

export function formatHours(seconds: number): string {
    return seconds < 60 ? EMPTY : `${decimal.format(seconds / 3600)} ч`;
}

export type Better = 'up' | 'down' | 'none';

export type MetricKind = 'count' | 'share' | 'duration' | 'score';

export type DeltaView = { text: string; direction: 'up' | 'down' | 'flat'; tone: 'good' | 'bad' | 'neutral' };

function deltaText(kind: MetricKind, current: number, previous: number): string | null {
    const diff = current - previous;

    if (kind === 'share') {
        const points = Math.round(diff * 100);

        return points === 0 ? null : `${points > 0 ? '+' : '−'}${Math.abs(points)} п.п.`;
    }

    if (kind === 'score') {
        return Math.abs(diff) < 0.05 ? null : `${diff > 0 ? '+' : '−'}${decimal.format(Math.abs(diff))}`;
    }

    if (previous === 0) {
        return null;
    }

    const percent = Math.round((diff / previous) * 100);

    return percent === 0 ? null : `${percent > 0 ? '+' : '−'}${Math.abs(percent)}%`;
}

function toneOf(better: Better, direction: 'up' | 'down'): DeltaView['tone'] {
    if (better === 'none') {
        return 'neutral';
    }

    return better === direction ? 'good' : 'bad';
}

export function compare(kind: MetricKind, current: number | null, previous: number | null, better: Better) {
    if (current === null || previous === null) {
        return null;
    }

    const text = deltaText(kind, current, previous);

    if (!text) {
        return { text: 'без изменений', direction: 'flat', tone: 'neutral' } satisfies DeltaView;
    }

    const direction = current > previous ? 'up' : 'down';

    return { text, direction, tone: toneOf(better, direction) } satisfies DeltaView;
}

export function formatValue(kind: MetricKind, value: number | null): string {
    switch (kind) {
        case 'count':
            return formatCount(value);
        case 'share':
            return formatPercent(value);
        case 'duration':
            return formatDuration(value);
        case 'score':
            return formatScore(value);
    }
}

export function formatDay(day: string): string {
    return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(
        new Date(`${day}T00:00:00Z`),
    );
}
