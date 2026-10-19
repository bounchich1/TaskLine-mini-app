import type { Team, TeamStrategy } from '@/shared/types/routing';

export const STRATEGY_OPTIONS: readonly { value: TeamStrategy; label: string; note: string }[] = [
    { value: 'least_loaded', label: 'Наименее загруженному', note: 'кто сейчас ведёт меньше обращений' },
    { value: 'round_robin', label: 'По очереди', note: 'каждому участнику по кругу' },
    { value: 'skills', label: 'По навыкам', note: 'сначала тем, кто ведёт эту тему' },
];

export const strategyLabel = (strategy: TeamStrategy) =>
    STRATEGY_OPTIONS.find((option) => option.value === strategy)?.label ?? strategy;

const text = (form: FormData, name: string) => {
    const value = form.get(name);

    return typeof value === 'string' ? value.trim() : '';
};

export function teamPayload(form: FormData) {
    const members = form.getAll('member').map(String);

    return {
        name: text(form, 'name'),
        supervisor_id: text(form, 'supervisor_id') || null,
        auto_assign: form.get('auto_assign') === 'on',
        strategy: text(form, 'strategy') as TeamStrategy,
        capacity: Number(text(form, 'capacity')),
        offer_timeout_seconds: Math.round(Number(text(form, 'offer_timeout_minutes')) * 60),
        allow_self_take: form.get('allow_self_take') === 'on',
        members: members.map((employeeId) => ({
            employee_id: employeeId,
            skills: form.getAll(`skill:${employeeId}`).map(String),
        })),
    };
}

const NEW_TEAM = {
    title: 'Новая команда',
    name: '',
    supervisor: '',
    autoAssign: false,
    strategy: 'least_loaded' as TeamStrategy,
    capacity: 5,
    offerMinutes: 3,
    allowSelfTake: true,
    skills: new Map<string, Set<string>>(),
};

export function teamDefaults(team: Team | null) {
    if (!team) {
        return NEW_TEAM;
    }

    return {
        title: `Команда «${team.name}»`,
        name: team.name,
        supervisor: team.supervisor_id ?? '',
        autoAssign: team.auto_assign,
        strategy: team.strategy,
        capacity: team.capacity,
        offerMinutes: team.offer_timeout_seconds / 60,
        allowSelfTake: team.allow_self_take,
        skills: new Map(team.members.map((member) => [member.employee_id, new Set(member.skills)])),
    };
}
