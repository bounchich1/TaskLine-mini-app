import type { AdminSave } from '@/features/admin/hooks/use-admin-save';
import { ROLE_OPTIONS } from '@/shared/config/labels';
import type { Employee } from '@/shared/types/api';
import { FormField, CheckboxField, Select } from '@/shared/ui';

import { FormDialog } from '../FormDialog/FormDialog';

type EmployeeDialogProps = {
    employee: Employee | null;
    busy: boolean;
    error: unknown;
    save: AdminSave;
    onClose: () => void;
};

export function EmployeeDialog({ employee, busy, error, save, onClose }: EmployeeDialogProps) {
    const submit = (form: FormData) => {
        void save(`/v1/admin/employees${employee ? `/${employee.id}` : ''}`, {
            method: employee ? 'PATCH' : 'POST',
            body: {
                max_user_id: employee?.max_user_id ?? form.get('max_user_id'),
                name: form.get('name'),
                role: form.get('role'),
                blocked: form.get('blocked') === 'on',
            },
            version: employee?.version ?? 0,
        });
    };

    return (
        <FormDialog
            title={employee ? 'Изменить сотрудника' : 'Добавить сотрудника'}
            formId="employee-form"
            busy={busy}
            error={error}
            onClose={onClose}
            onSubmit={submit}
        >
            <FormField label="MAX ID">
                <input
                    name="max_user_id"
                    pattern="[0-9]+"
                    required
                    defaultValue={employee?.max_user_id}
                    readOnly={!!employee}
                />
            </FormField>

            <FormField label="Имя">
                <input name="name" required maxLength={120} defaultValue={employee?.name} />
            </FormField>

            <FormField label="Роль">
                <Select
                    name="role"
                    options={ROLE_OPTIONS.map(([value, label]) => ({ value, label }))}
                    defaultValue={employee?.role ?? 'support'}
                />
            </FormField>

            <CheckboxField name="blocked" defaultChecked={employee?.blocked}>
                Заблокировать доступ
            </CheckboxField>
        </FormDialog>
    );
}
