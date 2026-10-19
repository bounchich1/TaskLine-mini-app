import type { IncidentCandidate } from '@/shared/types/incidents';

import './CandidateList.scss';

const LINKABLE = new Set(['open', 'in_progress']);

type CandidateListProps = {
    candidates: IncidentCandidate[];
    selected: Set<string>;
    onChange: (selected: Set<string>) => void;
};

function unavailable(candidate: IncidentCandidate): string | null {
    if (!LINKABLE.has(candidate.status)) {
        return 'уже закрыто';
    }

    return candidate.linked_elsewhere ? 'в другом инциденте' : null;
}

export function CandidateList({ candidates, selected, onChange }: CandidateListProps) {
    const toggle = (id: string, checked: boolean) => {
        const next = new Set(selected);

        if (checked) {
            next.add(id);
        } else {
            next.delete(id);
        }

        onChange(next);
    };

    return (
        <fieldset className="candidate-list">
            <legend className="candidate-list__legend">
                Обращения детектора · выбрано {selected.size} из {candidates.length}
            </legend>

            <ul className="candidate-list__items">
                {candidates.map((candidate) => {
                    const reason = unavailable(candidate);

                    return (
                        <li key={candidate.id}>
                            <label className="candidate-list__item">
                                <input
                                    className="candidate-list__check"
                                    type="checkbox"
                                    checked={selected.has(candidate.id)}
                                    disabled={reason !== null}
                                    onChange={(event) => {
                                        toggle(candidate.id, event.currentTarget.checked);
                                    }}
                                />

                                <span className="candidate-list__number">№{candidate.number}</span>
                                <span className="candidate-list__text">{candidate.description}</span>
                                {reason ? <span className="candidate-list__note">{reason}</span> : null}
                            </label>
                        </li>
                    );
                })}
            </ul>
        </fieldset>
    );
}
