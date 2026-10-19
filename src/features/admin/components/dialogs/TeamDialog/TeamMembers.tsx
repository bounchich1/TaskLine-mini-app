import { roleLabel } from '@/shared/config/labels';
import type { Dictionary, Employee } from '@/shared/types/api';

type TeamMembersProps = {
    people: Employee[];
    dictionaries: Dictionary[] | undefined;
    skills: Map<string, Set<string>>;
};

export function TeamMembers({ people, dictionaries, skills }: TeamMembersProps) {
    const options = (dictionaries ?? [])
        .filter((item) => item.active && (item.dimension === 'tag' || item.dimension === 'complexity'))
        .map((item) => ({
            value: `${item.dimension}:${item.code}`,
            label: item.dimension === 'complexity' ? `Сложность: ${item.label.toLowerCase()}` : item.label,
        }));

    return (
        <fieldset className="team-members">
            <legend className="team-members__legend">Участники и навыки</legend>

            {people.map((employee) => {
                const own = skills.get(employee.id);

                return (
                    <div key={employee.id} className="team-members__row">
                        <label className="team-members__person">
                            <input
                                type="checkbox"
                                className="team-members__check"
                                name="member"
                                value={employee.id}
                                defaultChecked={skills.has(employee.id)}
                            />

                            <span>
                                {employee.name}
                                <small className="team-members__role">{roleLabel(employee.role)}</small>
                            </span>
                        </label>

                        <details className="team-members__skills">
                            <summary>Навыки{own?.size ? `: ${own.size}` : ''}</summary>

                            <div className="team-members__skill-list">
                                {options.map((option) => (
                                    <label key={option.value} className="team-members__skill">
                                        <input
                                            type="checkbox"
                                            className="team-members__check"
                                            name={`skill:${employee.id}`}
                                            value={option.value}
                                            defaultChecked={own?.has(option.value) ?? false}
                                        />

                                        {option.label}
                                    </label>
                                ))}
                            </div>
                        </details>
                    </div>
                );
            })}
        </fieldset>
    );
}
