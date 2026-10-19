import type { RoutingRule } from '@/features/admin/model/types';
import { DIMENSION_GROUP_LABELS, DIMENSIONS } from '@/shared/config/labels';
import type { Dictionary } from '@/shared/types/api';
import type { Team } from '@/shared/types/routing';
import { Icon, Select } from '@/shared/ui';

type RuleRowProps = {
    index: number;
    total: number;
    rule: RoutingRule;
    teams: Team[];
    dictionaries: Dictionary[];
    onChange: (rule: RoutingRule | null) => void;
    onMove: (step: number) => void;
};

export function RuleRow({ index, total, rule, teams, dictionaries, onChange, onMove }: RuleRowProps) {
    const toggle = (dimension: (typeof DIMENSIONS)[number], code: string, checked: boolean) => {
        const values = new Set(rule.match[dimension]);

        if (checked) {
            values.add(code);
        } else {
            values.delete(code);
        }

        onChange({ ...rule, match: { ...rule.match, [dimension]: [...values] } });
    };

    const up = () => {
        onMove(-1);
    };

    const down = () => {
        onMove(1);
    };

    const remove = () => {
        onChange(null);
    };

    return (
        <li className="rule-row">
            <div className="rule-row__head">
                <span className="rule-row__number">{index + 1}</span>
                <span className="rule-row__label">В команду</span>

                <Select
                    className="rule-row__team"
                    aria-label={`Команда для правила ${index + 1}`}
                    value={rule.team_id}
                    options={teams.map((team) => ({ value: team.id, label: team.name }))}
                    onChange={(teamId) => {
                        onChange({ ...rule, team_id: teamId });
                    }}
                />

                <span className="rule-row__tools">
                    <button type="button" aria-label="Выше" disabled={index === 0} onClick={up}>
                        <Icon name="chevron" size={16} className="rule-row__up" />
                    </button>

                    <button type="button" aria-label="Ниже" disabled={index === total - 1} onClick={down}>
                        <Icon name="chevron" size={16} />
                    </button>

                    <button type="button" aria-label={`Удалить правило ${index + 1}`} onClick={remove}>
                        <Icon name="close" size={16} />
                    </button>
                </span>
            </div>

            {DIMENSIONS.map((dimension) => (
                <fieldset key={dimension} className="rule-row__dimension">
                    <legend className="rule-row__legend">
                        {DIMENSION_GROUP_LABELS[dimension]}
                        {rule.match[dimension].length ? '' : ' — любые'}
                    </legend>

                    {dictionaries
                        .filter((item) => item.dimension === dimension && item.active)
                        .map((item) => (
                            <label key={item.code} className="rule-row__chip">
                                <input
                                    type="checkbox"
                                    className="visually-hidden"
                                    checked={rule.match[dimension].includes(item.code)}
                                    onChange={(event) => {
                                        toggle(dimension, item.code, event.target.checked);
                                    }}
                                />

                                {item.label}
                            </label>
                        ))}
                </fieldset>
            ))}
        </li>
    );
}
