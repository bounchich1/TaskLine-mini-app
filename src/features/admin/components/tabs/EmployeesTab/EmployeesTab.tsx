import { Button } from '@maxhub/max-ui';

import { AdminCard } from '@/features/admin/components/AdminCard/AdminCard';
import { AdminRow } from '@/features/admin/components/AdminRow/AdminRow';
import { employeeRoleLabel } from '@/shared/config/labels';
import type { Employee } from '@/shared/types/api';
import { Avatar } from '@/shared/ui';

type EmployeesTabProps = {
  employees: Employee[] | undefined;
  /** Opens the employee dialog; `null` adds a new employee. */
  onEdit: (employee: Employee | null) => void;
};

/** Staff with access to the mini-app. */
export function EmployeesTab({ employees, onEdit }: EmployeesTabProps) {
  return (
    <AdminCard
      title="Сотрудники"
      action={
        <Button
          size="small"
          onClick={() => {
            onEdit(null);
          }}
        >
          Добавить сотрудника
        </Button>
      }
    >
      <div>
        {employees?.map((employee) => (
          <AdminRow key={employee.id}>
            <Avatar size="small">{employee.name[0]}</Avatar>
            <div className="admin-row__main">
              <strong className="admin-row__title">{employee.name}</strong>
              <small className="admin-row__meta">
                MAX ID: {employee.max_user_id} · {employeeRoleLabel(employee.role)}
              </small>
            </div>
            <span
              className={`badge admin-row__badge ${employee.blocked ? 'badge--status-closed' : 'badge--status-in-progress'}`}
            >
              {employee.blocked ? 'Заблокирован' : 'Активен'}
            </span>
            <Button
              variant="ghost"
              size="small"
              onClick={() => {
                onEdit(employee);
              }}
            >
              Изменить
            </Button>
          </AdminRow>
        ))}
      </div>
    </AdminCard>
  );
}
