import { Button } from '@maxhub/max-ui';

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
    <section className="admin-card">
      <div className="admin-card-head">
        <h2>Сотрудники</h2>
        <Button
          size="small"
          onClick={() => {
            onEdit(null);
          }}
        >
          Добавить сотрудника
        </Button>
      </div>
      <div className="admin-list">
        {employees?.map((employee) => (
          <div className="admin-row" key={employee.id}>
            <Avatar size="small">{employee.name[0]}</Avatar>
            <div>
              <strong>{employee.name}</strong>
              <small>
                MAX ID: {employee.max_user_id} · {employeeRoleLabel(employee.role)}
              </small>
            </div>
            <span className={`badge ${employee.blocked ? 'status-closed' : 'status-in_progress'}`}>
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
          </div>
        ))}
      </div>
    </section>
  );
}
