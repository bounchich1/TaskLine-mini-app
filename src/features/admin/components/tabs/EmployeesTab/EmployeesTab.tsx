import { Button } from '@maxhub/max-ui';

import { AdminCard } from '@/features/admin/components/AdminCard/AdminCard';
import { AdminRow } from '@/features/admin/components/AdminRow/AdminRow';
import { roleLabel } from '@/shared/config/labels';
import type { Employee } from '@/shared/types/api';
import { Avatar } from '@/shared/ui';

type EmployeesTabProps = {
    employees: Employee[] | undefined;
    onEdit: (employee: Employee | null) => void;
};

export function EmployeesTab({ employees, onEdit }: EmployeesTabProps) {
    return (
        <AdminCard
            title="Сотрудники"
            action={
                <Button
                    size="xsmall"
                    onClick={() => {
                        onEdit(null);
                    }}
                >
                    Добавить сотрудника
                </Button>
            }
        >
            <div className="admin-card__list">
                {employees?.map((employee) => (
                    <AdminRow key={employee.id}>
                        <Avatar name={employee.name} size={32} />

                        <div className="admin-row__main">
                            <strong className="admin-row__title">{employee.name}</strong>

                            <small className="admin-row__meta">
                                {roleLabel(employee.role)} · MAX ID {employee.max_user_id}
                                {employee.blocked ? (
                                    <span className="admin-row__status admin-row__status--negative">
                                        {' '}
                                        · Заблокирован
                                    </span>
                                ) : null}
                            </small>
                        </div>

                        <Button
                            variant="secondary"
                            size="xsmall"
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
