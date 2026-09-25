function zonedFormatter(timeZone: string): Intl.DateTimeFormat {
    return new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
    });
}

function wallClockAsUtc(instant: number, formatter: Intl.DateTimeFormat): number {
    const parts = Object.fromEntries(formatter.formatToParts(new Date(instant)).map((part) => [part.type, part.value]));

    return Date.UTC(
        Number(parts.year),
        Number(parts.month) - 1,
        Number(parts.day),
        Number(parts.hour),
        Number(parts.minute),
        Number(parts.second),
    );
}

export function dayBoundary(day: string, timeZone: string, nextDay = false): string {
    const [year, month, date] = day.split('-').map(Number);
    const target = new Date(Date.UTC(year, month - 1, date + (nextDay ? 1 : 0)));
    const formatter = zonedFormatter(timeZone);
    let guess = target.getTime();

    for (let i = 0; i < 3; i++) {
        const delta = target.getTime() - wallClockAsUtc(guess, formatter);

        if (delta === 0) {
            break;
        }

        guess += delta;
    }

    return new Date(guess).toISOString();
}
