import type { AdminSave } from '@/features/admin/hooks/use-admin-save';
import type { Template } from '@/features/admin/model/types';
import { FormField } from '@/shared/ui';

import { FormDialog } from '../FormDialog/FormDialog';

type TemplateDialogProps = {
  template: Template;
  busy: boolean;
  error: unknown;
  save: AdminSave;
  onClose: () => void;
};

/** Edits the text of a bot message. */
export function TemplateDialog({ template, busy, error, save, onClose }: TemplateDialogProps) {
  const submit = (form: FormData) => {
    void save(`/v1/admin/templates/${template.code}`, {
      method: 'PUT',
      body: { body: form.get('body') },
      version: template.version,
    });
  };
  return (
    <FormDialog
      title="Изменить сообщение бота"
      formId="template-form"
      busy={busy}
      error={error}
      onClose={onClose}
      onSubmit={submit}
    >
      <FormField label={template.code}>
        <textarea name="body" rows={7} maxLength={3000} defaultValue={template.body} required />
      </FormField>
    </FormDialog>
  );
}
