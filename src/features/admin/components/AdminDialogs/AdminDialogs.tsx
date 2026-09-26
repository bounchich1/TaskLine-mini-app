import type { AdminSave } from '@/features/admin/hooks/use-admin-save';
import type { AdminDialog } from '@/features/admin/model/types';
import type { Session } from '@/shared/types/api';

import { BlockEmployeeDialog } from '../dialogs/BlockEmployeeDialog/BlockEmployeeDialog';
import { DictionaryDialog } from '../dialogs/DictionaryDialog/DictionaryDialog';
import { EmployeeDialog } from '../dialogs/EmployeeDialog/EmployeeDialog';
import { ResolutionDialog } from '../dialogs/ResolutionDialog/ResolutionDialog';
import { TemplateDialog } from '../dialogs/TemplateDialog/TemplateDialog';

type AdminDialogsProps = {
    dialog: AdminDialog;
    session: Session;
    busy: boolean;
    error: unknown;
    save: AdminSave;
    onClose: () => void;
};

export function AdminDialogs({ dialog, session, ...props }: AdminDialogsProps) {
    switch (dialog.kind) {
        case 'employee':
            return <EmployeeDialog employee={dialog.employee} session={session} {...props} />;
        case 'block':
            return <BlockEmployeeDialog employee={dialog.employee} {...props} />;
        case 'dictionary':
            return <DictionaryDialog value={dialog.value} {...props} />;
        case 'template':
            return <TemplateDialog template={dialog.template} {...props} />;
        case 'resolution':
            return <ResolutionDialog resolution={dialog.resolution} {...props} />;
    }
}
