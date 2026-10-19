import { followUpOf, MACRO_VARIABLES } from '@/features/routing/model/macros';
import type { Dictionary } from '@/shared/types/api';
import type { Macro } from '@/shared/types/routing';
import { DictionarySelect, FormField, Select } from '@/shared/ui';

import './MacroFields.scss';

const FOLLOW_UPS = [
    { value: 'none', label: 'Ничего' },
    { value: 'wait', label: 'Ждать ответа клиента' },
    { value: 'close', label: 'Закрыть после доставки ответа' },
];

type MacroFieldsProps = { macro: Macro | null; dictionaries: Dictionary[] | undefined };

export function MacroFields({ macro, dictionaries }: MacroFieldsProps) {
    const actions = macro?.actions ?? {};

    return (
        <div className="macro-fields">
            <FormField label="Название" hint="По нему шаблон ищется после «/» в поле ответа.">
                <input name="title" defaultValue={macro?.title} maxLength={80} required />
            </FormField>

            <FormField label="Текст ответа" hint={MACRO_VARIABLES}>
                <textarea name="body" rows={5} maxLength={4000} defaultValue={macro?.body} required />
            </FormField>

            <div className="macro-fields__row">
                <FormField label="Тема">
                    <DictionarySelect
                        name="tag"
                        items={dictionaries}
                        dimension="tag"
                        activeOnly
                        emptyLabel="Не менять"
                        defaultValue={actions.tag ?? ''}
                    />
                </FormField>

                <FormField label="Срочность">
                    <DictionarySelect
                        name="urgency"
                        items={dictionaries}
                        dimension="urgency"
                        activeOnly
                        emptyLabel="Не менять"
                        defaultValue={actions.urgency ?? ''}
                    />
                </FormField>

                <FormField label="Сложность">
                    <DictionarySelect
                        name="complexity"
                        items={dictionaries}
                        dimension="complexity"
                        activeOnly
                        emptyLabel="Не менять"
                        defaultValue={actions.complexity ?? ''}
                    />
                </FormField>
            </div>

            <FormField label="После отправки">
                <Select name="follow_up" options={FOLLOW_UPS} defaultValue={followUpOf(actions)} />
            </FormField>
        </div>
    );
}
