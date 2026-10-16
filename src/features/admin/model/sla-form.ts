import type { SlaConfig, SlaPolicy, WorkHours } from '@/shared/types/api';

export type DayForm = { works: boolean; from: string; to: string; breakFrom: string; breakTo: string };

export type TargetForm = { first: string; resolution: string };

export type OverrideForm = TargetForm & { id: string; urgency: string; tag: string };

export type SlaDraft = {
    enabled: boolean;
    notifyMax: boolean;
    clientEta: boolean;
    reminder: string;
    close: string;
    days: DayForm[];
    holidays: string[];
    workdays: string[];
    targets: Partial<Record<string, TargetForm>>;
    overrides: OverrideForm[];
};

export const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const;

const WEEK_KEYS = ['1', '2', '3', '4', '5', '6', '7'] as const;
const STATUTORY = ['01-01', '01-02', '01-03', '01-04', '01-05', '01-06', '01-07', '01-08'];
const MOVABLE = ['02-23', '03-08', '05-01', '05-09', '06-12', '11-04'];
const DAY_MS = 86400000;

function dayForm(hours: WorkHours): DayForm {
    if (!hours.length) {
        return { works: false, from: '09:00', to: '18:00', breakFrom: '', breakTo: '' };
    }

    const first = hours[0];
    const last = hours[hours.length - 1];
    const split = hours.length > 1;

    return {
        works: true,
        from: first[0],
        to: last[1],
        breakFrom: split ? first[1] : '',
        breakTo: split ? last[0] : '',
    };
}

function workHours(day: DayForm): WorkHours {
    if (!day.works) {
        return [];
    }

    return day.breakFrom && day.breakTo
        ? [
              [day.from, day.breakFrom],
              [day.breakTo, day.to],
          ]
        : [[day.from, day.to]];
}

const hoursText = (minutes: number) => String(Number((minutes / 60).toFixed(2)));
const toMinutes = (hours: string) => Math.round(Number(hours.replace(',', '.')) * 60);

const targetForm = (policy: SlaPolicy): TargetForm => ({
    first: String(policy.first_response_minutes),
    resolution: hoursText(policy.resolution_minutes),
});

export function draftFrom(config: SlaConfig): SlaDraft {
    const base = config.policies.filter((policy) => policy.tag === '*');

    return {
        enabled: config.enabled,
        notifyMax: config.notify_max,
        clientEta: config.client_eta,
        reminder: String(config.waiting_reminder_hours),
        close: String(config.waiting_close_hours),
        days: WEEK_KEYS.map((key) => dayForm(config.week[key])),
        holidays: config.holidays,
        workdays: config.workdays,
        targets: Object.fromEntries(base.map((policy) => [policy.urgency, targetForm(policy)])),
        overrides: config.policies
            .filter((policy) => policy.tag !== '*')
            .map((policy) => ({
                ...targetForm(policy),
                id: crypto.randomUUID(),
                urgency: policy.urgency,
                tag: policy.tag,
            })),
    };
}

function policy(urgency: string, tag: string, target: TargetForm | undefined): SlaPolicy[] {
    if (!target?.first.trim() || !target.resolution.trim()) {
        return [];
    }

    return [
        {
            urgency,
            tag,
            first_response_minutes: Number(target.first),
            resolution_minutes: toMinutes(target.resolution),
        },
    ];
}

export function payloadFrom(draft: SlaDraft) {
    return {
        enabled: draft.enabled,
        notify_max: draft.notifyMax,
        client_eta: draft.clientEta,
        waiting_reminder_hours: Number(draft.reminder || 0),
        waiting_close_hours: Number(draft.close || 0),
        week: Object.fromEntries(WEEK_KEYS.map((key, index) => [key, workHours(draft.days[index])])),
        holidays: draft.holidays,
        workdays: draft.workdays,
        policies: [
            ...Object.entries(draft.targets).flatMap(([urgency, target]) => policy(urgency, '*', target)),
            ...draft.overrides.flatMap((entry) =>
                entry.urgency && entry.tag ? policy(entry.urgency, entry.tag, entry) : [],
            ),
        ],
    };
}

function isoDate(time: number): string {
    return new Date(time).toISOString().slice(0, 10);
}

function isWeekend(time: number): boolean {
    return [0, 6].includes(new Date(time).getUTCDay());
}

export function russianHolidays(year: number): string[] {
    const days = new Set(STATUTORY.map((day) => `${year}-${day}`));

    for (const day of MOVABLE) {
        const time = Date.parse(`${year}-${day}T00:00:00Z`);

        days.add(isoDate(time));

        if (!isWeekend(time)) {
            continue;
        }

        let next = time + DAY_MS;

        while (isWeekend(next) || days.has(isoDate(next))) {
            next += DAY_MS;
        }

        days.add(isoDate(next));
    }

    return [...days].sort();
}

export function mergeDates(current: string[], added: string[]): string[] {
    return [...new Set([...current, ...added])].sort();
}
