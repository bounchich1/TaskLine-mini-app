import type { AdminSave } from '@/features/admin/hooks/use-admin-save';
import { dictionaryDefaults, dictionaryPayload } from '@/features/admin/model/dictionary-form';
import { DIMENSION_LABELS, DIMENSIONS } from '@/shared/config/labels';
import type { Dictionary } from '@/shared/types/api';
import { FormField, CheckboxField, Select } from '@/shared/ui';

import { FormDialog } from '../FormDialog/FormDialog';

type DictionaryDialogProps = {
    value: Dictionary | null;
    busy: boolean;
    error: unknown;
    save: AdminSave;
    onClose: () => void;
};

const DIMENSION_OPTIONS = DIMENSIONS.map((dimension) => ({ value: dimension, label: DIMENSION_LABELS[dimension] }));

export function DictionaryDialog({ value, busy, error, save, onClose }: DictionaryDialogProps) {
    const initial = dictionaryDefaults(value);

    const submit = (form: FormData) => {
        void save('/v1/admin/dictionaries', {
            method: 'PUT',
            body: dictionaryPayload(form, value),
            version: value?.version ?? 0,
        });
    };

    return (
        <FormDialog
            title={initial.title}
            formId="dictionary-form"
            busy={busy}
            error={error}
            onClose={onClose}
            onSubmit={submit}
        >
            <FormField label="Справочник">
                <Select
                    name="dimension"
                    options={DIMENSION_OPTIONS}
                    defaultValue={initial.dimension}
                    disabled={value !== null}
                />
            </FormField>

            <FormField label="Название" hint={initial.codeHint}>
                <input name="label" defaultValue={initial.label} maxLength={120} required />
            </FormField>

            <FormField label="Описание для ИИ" hint="О чём эта тема и чем отличается от похожих. До 200 символов.">
                <textarea name="description" rows={2} maxLength={200} defaultValue={initial.description} />
            </FormField>

            <FormField label="Примеры сообщений клиентов" hint="До 3 примеров, по одному в строке.">
                <textarea
                    name="examples"
                    rows={3}
                    defaultValue={initial.examples}
                    placeholder="Заказ должен был прийти вчера, но его нет"
                />
            </FormField>

            <FormField label="Приоритет">
                <input name="rank" type="number" min={0} max={100} defaultValue={initial.rank} required />
            </FormField>

            <CheckboxField name="active" defaultChecked={initial.active}>
                Использовать в новых обращениях
            </CheckboxField>
        </FormDialog>
    );
}
