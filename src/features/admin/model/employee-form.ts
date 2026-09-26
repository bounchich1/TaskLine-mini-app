import type { ApiOptions } from '@/shared/api/http';
import type { Employee, Role, Session } from '@/shared/types/api';

import { employeeAccess } from './employee-access';

const FIELDS = ['max_user_id', 'name', 'role'] as const;

type EmployeeRequest = { path: string; options: ApiOptions };

export type EmployeeForm = {
    title: string;
    role: Role;
    editMaxId: boolean;
    editRole: boolean;
    maxIdHint: string | null;
    nameHint: string | null;
    request: (data: FormData) => EmployeeRequest | null;
};

function formValues(data: FormData) {
    return Object.fromEntries(
        FIELDS.map((field) => {
            const value = data.get(field);

            return [field, typeof value === 'string' ? value.trim() : ''];
        }),
    );
}

function newEmployeeForm(): EmployeeForm {
    return {
        title: 'Добавить сотрудника',
        role: 'support',
        editMaxId: true,
        editRole: true,
        maxIdHint: 'Сотрудник узнает свой MAX ID, написав боту для сотрудников.',
        nameHint: null,
        request: (data) => ({
            path: '/v1/admin/employees',
            options: { method: 'POST', body: formValues(data), version: 0 },
        }),
    };
}

function lockedMaxIdHint(employee: Employee) {
    return employee.activated_at ? 'Сотрудник уже вошёл в приложение, MAX ID закреплён.' : null;
}

export function employeeForm(session: Session, employee: Employee | null): EmployeeForm {
    if (!employee) {
        return newEmployeeForm();
    }

    const access = employeeAccess(session, employee);

    return {
        title: 'Изменить сотрудника',
        role: employee.role,
        editMaxId: access.editMaxId,
        editRole: access.editRole,
        maxIdHint: access.editMaxId
            ? 'Можно исправить, пока сотрудник не вошёл в приложение.'
            : lockedMaxIdHint(employee),
        nameHint: access.self ? 'В своей учётной записи можно изменить только имя.' : null,
        request: (data) => {
            const values = formValues(data);

            const changes = Object.fromEntries(
                FIELDS.filter((field) => values[field] && values[field] !== employee[field]).map((field) => [
                    field,
                    values[field],
                ]),
            );

            if (Object.keys(changes).length === 0) {
                return null;
            }

            return {
                path: `/v1/admin/employees/${employee.id}`,
                options: { method: 'PATCH', body: changes, version: employee.version },
            };
        },
    };
}
