import { clsx } from 'clsx';

import type { Team } from '@/shared/types/routing';

import './QueueScope.scss';

type Scope = { assignee: string; team: string };

type QueueScopeProps = {
    me: string;
    teams: Team[];
    supervisor: boolean;
    value: Scope;
    onChange: (scope: Scope) => void;
};

export function QueueScope({ me, teams, supervisor, value, onChange }: QueueScopeProps) {
    const visible = supervisor
        ? teams
        : teams.filter((team) => team.members.some((member) => member.employee_id === me));

    const options: { key: string; label: string; scope: Scope; hint?: string }[] = [
        { key: 'mine', label: 'Мои', scope: { assignee: me, team: '' } },
        { key: 'all', label: 'Все', scope: { assignee: '', team: '' } },
        ...visible.map((team) => ({
            key: team.id,
            label: team.name,
            scope: { assignee: '', team: team.id },
            hint: team.queue ? String(team.queue) : undefined,
        })),
    ];

    return (
        <div className="queue-scope" role="group" aria-label="Чьи обращения показать">
            {options.map((option) => {
                const selected = option.scope.assignee === value.assignee && option.scope.team === value.team;

                return (
                    <button
                        key={option.key}
                        type="button"
                        aria-pressed={selected}
                        className={clsx('queue-scope__chip', selected && 'queue-scope__chip--selected')}
                        onClick={() => {
                            onChange(option.scope);
                        }}
                    >
                        {option.label}
                        {option.hint ? <span className="queue-scope__count">{option.hint}</span> : null}
                    </button>
                );
            })}
        </div>
    );
}
