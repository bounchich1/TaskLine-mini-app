const RUSSIAN_ZONES: readonly [zone: string, city: string][] = [
    ['Europe/Kaliningrad', 'Калининград'],
    ['Europe/Moscow', 'Москва'],
    ['Europe/Samara', 'Самара'],
    ['Asia/Yekaterinburg', 'Екатеринбург'],
    ['Asia/Omsk', 'Омск'],
    ['Asia/Novosibirsk', 'Новосибирск'],
    ['Asia/Krasnoyarsk', 'Красноярск'],
    ['Asia/Irkutsk', 'Иркутск'],
    ['Asia/Yakutsk', 'Якутск'],
    ['Asia/Vladivostok', 'Владивосток'],
    ['Asia/Magadan', 'Магадан'],
    ['Asia/Kamchatka', 'Петропавловск-Камчатский'],
];

function utcOffset(zone: string): string {
    try {
        const part = new Intl.DateTimeFormat('ru', { timeZone: zone, timeZoneName: 'shortOffset' })
            .formatToParts(new Date())
            .find((item) => item.type === 'timeZoneName');

        return part ? part.value.replace('GMT', 'UTC') : '';
    } catch {
        return '';
    }
}

export function timezoneOptions(current: string): { value: string; label: string; note?: string }[] {
    const zones = RUSSIAN_ZONES.some(([zone]) => zone === current)
        ? RUSSIAN_ZONES
        : [...RUSSIAN_ZONES, [current, current] as const];

    return zones.map(([zone, city]) => ({ value: zone, label: city, note: utcOffset(zone) || undefined }));
}
