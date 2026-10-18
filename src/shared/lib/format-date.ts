export function formatDate(value: string | null | undefined, timeZone: string, short = false) {
    if (!value) {
        return '—';
    }

    return new Intl.DateTimeFormat('ru-RU', {
        timeZone,
        day: '2-digit',
        month: 'short',
        ...(short ? {} : { hour: '2-digit', minute: '2-digit' }),
    }).format(new Date(value));
}

const MINUTE = 60000;
const DAY = 24 * 60 * MINUTE;

export function dayKey(value: string | number, timeZone: string): string {
    return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(
        new Date(value),
    );
}

export function formatDayTitle(value: string, timeZone: string, now: number): string {
    const key = dayKey(value, timeZone);

    if (key === dayKey(now, timeZone)) {
        return 'Сегодня';
    }

    if (key === dayKey(now - DAY, timeZone)) {
        return 'Вчера';
    }

    const sameYear = key.slice(0, 4) === dayKey(now, timeZone).slice(0, 4);

    return new Intl.DateTimeFormat('ru-RU', {
        timeZone,
        day: 'numeric',
        month: 'long',
        ...(sameYear ? {} : { year: 'numeric' }),
    }).format(new Date(value));
}

export function formatTimeAgo(value: string, timeZone: string, now: number): string {
    const minutes = Math.floor((now - Date.parse(value)) / MINUTE);

    if (minutes < 1) {
        return 'только что';
    }

    if (minutes < 60) {
        return `${minutes} мин назад`;
    }

    return new Intl.DateTimeFormat('ru-RU', { timeZone, hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}
