import type { Dictionary } from '@/shared/types/api';

import { formText } from './form-data';
import { linesOf } from './profile-form';

const MAX_EXAMPLES = 3;

export function dictionaryPayload(form: FormData, value: Dictionary | null) {
    return {
        dimension: value?.dimension ?? formText(form, 'dimension'),
        ...(value ? { code: value.code } : {}),
        label: formText(form, 'label'),
        rank: Number(formText(form, 'rank')),
        active: form.get('active') === 'on',
        description: formText(form, 'description'),
        examples: linesOf(formText(form, 'examples')).slice(0, MAX_EXAMPLES),
    };
}

export function dictionaryDefaults(value: Dictionary | null) {
    if (!value) {
        return {
            title: 'Добавить значение',
            codeHint: 'Код для отчётов и API создастся из названия',
            dimension: 'tag',
            label: '',
            description: '',
            examples: '',
            rank: 0,
            active: true,
        };
    }

    return {
        title: 'Изменить значение',
        codeHint: `Код ${value.code} не меняется`,
        dimension: value.dimension,
        label: value.label,
        description: value.description ?? '',
        examples: (value.examples ?? []).join('\n'),
        rank: value.rank,
        active: value.active,
    };
}
