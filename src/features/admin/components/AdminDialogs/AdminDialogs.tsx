import type { AdminSave } from '@/features/admin/hooks/use-admin-save';
import type { AdminDialog } from '@/features/admin/model/types';

import { DictionaryDialog } from '../dialogs/DictionaryDialog/DictionaryDialog';
import { EmployeeDialog } from '../dialogs/EmployeeDialog/EmployeeDialog';
import { ResolutionDialog } from '../dialogs/ResolutionDialog/ResolutionDialog';
import { TemplateDialog } from '../dialogs/TemplateDialog/TemplateDialog';

type AdminDialogsProps = {
  dialog: AdminDialog;
  busy: boolean;
  error: unknown;
  save: AdminSave;
  onClose: () => void;
};

export function AdminDialogs({ dialog, ...props }: AdminDialogsProps) {
  switch (dialog.kind) {
    case 'employee':
      return <EmployeeDialog employee={dialog.employee} {...props} />;
    case 'dictionary':
      return <DictionaryDialog value={dialog.value} {...props} />;
    case 'template':
      return <TemplateDialog template={dialog.template} {...props} />;
    case 'resolution':
      return <ResolutionDialog resolution={dialog.resolution} {...props} />;
  }
}
