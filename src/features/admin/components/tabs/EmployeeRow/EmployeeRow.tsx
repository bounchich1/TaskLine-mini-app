import { Button } from '@maxhub/max-ui';

import { employeeAccess } from '@/features/admin/model/employee-access';
import { employeeStatusLabel, roleLabel } from '@/shared/config/labels';
import type { Employee, Session } from '@/shared/types/api';
import { Avatar, Icon } from '@/shared/ui';

import './EmployeeRow.scss';

type EmployeeRowProps = {
    employee: Employee;
    session: Session;
    busy: boolean;
    onEdit: (employee: Employee) => void;
    onBlock: (employee: Employee) => void;
    onUnblock: (employee: Employee) => void;
};

export function EmployeeRow({ employee, session, busy, onEdit, onBlock, onUnblock }: EmployeeRowProps) {
    const access = employeeAccess(session, employee);
    const blocked = employee.status === 'blocked';

    return (
        <div className={`employee-row employee-row--${employee.status}`}>
            <Avatar name={employee.name} size={32} />

            <div className="employee-row__main">
                <strong className="employee-row__name">
                    {employee.name}
                    {access.self ? <span className="employee-row__you">Вы</span> : null}
                </strong>

                <small className="employee-row__meta">
                    {roleLabel(employee.role)} · MAX ID {employee.max_user_id}
                </small>

                {employee.status === 'active' ? null : (
                    <small className="employee-row__status">{employeeStatusLabel(employee.status)}</small>
                )}
            </div>

            <div className="employee-row__actions">
                {access.edit ? (
                    <Button
                        variant="secondary"
                        size="xsmall"
                        disabled={busy}
                        onClick={() => {
                            onEdit(employee);
                        }}
                    >
                        Изменить
                    </Button>
                ) : null}

                {access.block && blocked ? (
                    <Button
                        variant="secondary"
                        size="xsmall"
                        disabled={busy}
                        onClick={() => {
                            onUnblock(employee);
                        }}
                    >
                        Разблокировать
                    </Button>
                ) : null}

                {access.block && !blocked ? (
                    <button
                        className="employee-row__block"
                        aria-label={`Заблокировать ${employee.name}`}
                        title="Заблокировать"
                        disabled={busy}
                        onClick={() => {
                            onBlock(employee);
                        }}
                    >
                        <Icon name="ban" size={16} />
                    </button>
                ) : null}
            </div>
        </div>
    );
}
