import type { AdminSave } from '@/features/admin/hooks/use-admin-save';
import { assignableRoles } from '@/features/admin/model/employee-access';
import { employeeForm, type EmployeeForm } from '@/features/admin/model/employee-form';
import { roleLabel } from '@/shared/config/labels';
import type { Employee, Session } from '@/shared/types/api';
import { FormField, Select } from '@/shared/ui';

import { FormDialog } from '../FormDialog/FormDialog';

type EmployeeDialogProps = {
    employee: Employee | null;
    session: Session;
    busy: boolean;
    error: unknown;
    save: AdminSave;
    onClose: () => void;
};

function submitEmployee(
    form: EmployeeForm,
    data: FormData,
    { save, onClose }: Pick<EmployeeDialogProps, 'save' | 'onClose'>,
) {
    const request = form.request(data);

    if (request) {
        void save(request.path, request.options);
    } else {
        onClose();
    }
}

export function EmployeeDialog({ employee, session, busy, error, save, onClose }: EmployeeDialogProps) {
    const form = employeeForm(session, employee);

    return (
        <FormDialog
            title={form.title}
            formId="employee-form"
            busy={busy}
            error={error}
            onClose={onClose}
            onSubmit={(data) => {
                submitEmployee(form, data, { save, onClose });
            }}
        >
            <FormField label="MAX ID" hint={form.maxIdHint}>
                <input
                    name="max_user_id"
                    pattern="[0-9]+"
                    inputMode="numeric"
                    required
                    defaultValue={employee?.max_user_id}
                    readOnly={!form.editMaxId}
                />
            </FormField>

            <FormField label="Имя" hint={form.nameHint}>
                <input name="name" required maxLength={120} defaultValue={employee?.name} />
            </FormField>

            <FormField label="Роль">
                {form.editRole ? (
                    <Select name="role" options={assignableRoles(session)} defaultValue={form.role} />
                ) : (
                    <input value={roleLabel(form.role)} readOnly />
                )}
            </FormField>
        </FormDialog>
    );
}
