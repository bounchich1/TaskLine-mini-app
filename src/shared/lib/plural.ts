export type PluralForms = readonly [one: string, few: string, many: string];

export function plural(count: number, [one, few, many]: PluralForms): string {
    const lastTwo = Math.abs(count) % 100;
    const last = lastTwo % 10;

    if (last === 1 && lastTwo !== 11) {
        return one;
    }

    return last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14) ? few : many;
}
