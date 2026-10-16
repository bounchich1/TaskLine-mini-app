import type { OverrideForm, SlaDraft } from '@/features/admin/model/sla-form';
import type { Dictionary } from '@/shared/types/api';
import { DictionarySelect, Icon } from '@/shared/ui';

import { SlaTargetFields } from '../SlaTargetFields/SlaTargetFields';

import './SlaPolicies.scss';

type SlaPoliciesProps = {
    draft: SlaDraft;
    dictionaries: Dictionary[];
    onChange: (patch: Pick<SlaDraft, 'targets'> | Pick<SlaDraft, 'overrides'>) => void;
};

export function SlaPolicies({ draft, dictionaries, onChange }: SlaPoliciesProps) {
    const urgencies = dictionaries
        .filter((item) => item.dimension === 'urgency' && (item.active || draft.targets[item.code]))
        .sort((left, right) => right.rank - left.rank);

    const updateOverride = (id: string, patch: Partial<OverrideForm>) => {
        onChange({ overrides: draft.overrides.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)) });
    };

    return (
        <div className="sla-policies">
            <div className="sla-policies__grid" role="table" aria-label="Сроки по срочности">
                <div className="sla-policies__row sla-policies__row--head" role="row">
                    <span role="columnheader">Срочность</span>
                    <span role="columnheader">Первый ответ, мин</span>
                    <span role="columnheader">Решение, ч</span>
                </div>

                {urgencies.map((item) => (
                    <div className="sla-policies__row" role="row" key={item.code}>
                        <span>{item.label}</span>

                        <SlaTargetFields
                            label={item.label}
                            target={draft.targets[item.code]}
                            onChange={(target) => {
                                onChange({ targets: { ...draft.targets, [item.code]: target } });
                            }}
                        />
                    </div>
                ))}
            </div>

            <h3 className="sla-policies__title">Исключения по темам</h3>

            {draft.overrides.map((entry) => (
                <div className="sla-policies__override" key={entry.id}>
                    <DictionarySelect
                        aria-label="Тема"
                        items={dictionaries}
                        dimension="tag"
                        activeOnly
                        placeholder="Тема"
                        value={entry.tag}
                        onChange={(tag) => {
                            updateOverride(entry.id, { tag });
                        }}
                    />

                    <DictionarySelect
                        aria-label="Срочность"
                        items={dictionaries}
                        dimension="urgency"
                        activeOnly
                        placeholder="Срочность"
                        value={entry.urgency}
                        onChange={(urgency) => {
                            updateOverride(entry.id, { urgency });
                        }}
                    />

                    <SlaTargetFields
                        label="Исключение"
                        target={entry}
                        onChange={(target) => {
                            updateOverride(entry.id, target);
                        }}
                    />

                    <button
                        type="button"
                        className="sla-policies__remove"
                        aria-label="Убрать исключение"
                        onClick={() => {
                            onChange({ overrides: draft.overrides.filter((item) => item.id !== entry.id) });
                        }}
                    >
                        <Icon name="close" size={16} />
                    </button>
                </div>
            ))}

            <button
                type="button"
                className="sla-policies__add"
                onClick={() => {
                    const entry = { id: crypto.randomUUID(), urgency: '', tag: '', first: '', resolution: '' };

                    onChange({ overrides: [...draft.overrides, entry] });
                }}
            >
                Добавить исключение
            </button>
        </div>
    );
}
