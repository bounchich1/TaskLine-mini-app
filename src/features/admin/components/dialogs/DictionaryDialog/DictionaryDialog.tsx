import type { AdminSave } from '@/features/admin/hooks/use-admin-save';
import { DIMENSION_LABELS, DIMENSIONS } from '@/shared/config/labels';
import type { Dictionary } from '@/shared/types/api';
import { FormField, CheckboxField } from '@/shared/ui';

import { FormDialog } from '../FormDialog/FormDialog';

type DictionaryDialogProps = {
  /** `null` adds a new value. */
  value: Dictionary | null;
  busy: boolean;
  error: unknown;
  save: AdminSave;
  onClose: () => void;
};

/** Adds a classification value or edits one; the dimension and code are fixed once created. */
export function DictionaryDialog({ value, busy, error, save, onClose }: DictionaryDialogProps) {
  const submit = (form: FormData) => {
    void save('/v1/admin/dictionaries', {
      method: 'PUT',
      body: {
        dimension: value?.dimension ?? form.get('dimension'),
        code: value?.code ?? form.get('code'),
        label: form.get('label'),
        rank: Number(form.get('rank')),
        active: form.get('active') === 'on',
      },
      version: value?.version ?? 0,
    });
  };
  return (
    <FormDialog
      title={value ? 'Изменить значение' : 'Добавить значение'}
      formId="dictionary-form"
      busy={busy}
      error={error}
      onClose={onClose}
      onSubmit={submit}
    >
      <FormField label="Справочник">
        <select name="dimension" defaultValue={value?.dimension ?? 'tag'} disabled={!!value}>
          {DIMENSIONS.map((dimension) => (
            <option key={dimension} value={dimension}>
              {DIMENSION_LABELS[dimension]}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="Код">
        <input
          name="code"
          pattern="[a-z][a-z0-9_]*"
          maxLength={64}
          defaultValue={value?.code}
          readOnly={!!value}
          required
        />
      </FormField>
      <FormField label="Название">
        <input name="label" defaultValue={value?.label} maxLength={120} required />
      </FormField>
      <FormField label="Приоритет">
        <input
          name="rank"
          type="number"
          min={0}
          max={100}
          defaultValue={value?.rank ?? 0}
          required
        />
      </FormField>
      <CheckboxField name="active" defaultChecked={value?.active ?? true}>
        Использовать в новых обращениях
      </CheckboxField>
    </FormDialog>
  );
}
