import type { AdminSave } from '@/features/admin/hooks/use-admin-save';
import { ROLE_OPTIONS } from '@/shared/config/labels';
import type { Employee } from '@/shared/types/api';

import { FormDialog } from '../FormDialog/FormDialog';

type EmployeeDialogProps = {
  /** `null` adds a new employee. */
  employee: Employee | null;
  busy: boolean;
  error: unknown;
  save: AdminSave;
  onClose: () => void;
};

/** Adds an employee or changes one's name, role and access. The MAX ID cannot change. */
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
      <label className="form-field">
        MAX ID
        <input
          name="max_user_id"
          pattern="[0-9]+"
          required
          defaultValue={employee?.max_user_id}
          readOnly={!!employee}
        />
      </label>
      <label className="form-field">
        Имя
        <input name="name" required maxLength={120} defaultValue={employee?.name} />
      </label>
      <label className="form-field">
        Роль
        <select name="role" defaultValue={employee?.role ?? 'support'}>
          {ROLE_OPTIONS.map(([role, label]) => (
            <option key={role} value={role}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="checkbox">
        <input type="checkbox" name="blocked" defaultChecked={employee?.blocked} />
        Заблокировать доступ
      </label>
    </FormDialog>
  );
}
