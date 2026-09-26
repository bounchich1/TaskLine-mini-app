import { ROLE_OPTIONS } from '@/shared/config/labels';
import { can, roleRank } from '@/shared/lib/access';
import type { Employee, Role, Session } from '@/shared/types/api';

export type EmployeeAccess = {
    self: boolean;
    invited: boolean;
    edit: boolean;
    editMaxId: boolean;
    editRole: boolean;
    block: boolean;
};

export function employeeAccess(session: Session, employee: Employee): EmployeeAccess {
    const manage = can(session, 'employees.manage');
    const self = employee.id === session.employee.id;
    const invited = !employee.activated_at;
    const outranked = roleRank(employee.role) < roleRank(session.employee.role);
    const full = manage && !self && (invited || outranked);

    return {
        self,
        invited,
        edit: full || (manage && self),
        editMaxId: full && invited,
        editRole: full,
        block: full,
    };
}

export function assignableRoles(session: Session): { value: Role; label: string }[] {
    const rank = roleRank(session.employee.role);

    return ROLE_OPTIONS.filter(([role]) => roleRank(role) <= rank).map(([value, label]) => ({ value, label }));
}
