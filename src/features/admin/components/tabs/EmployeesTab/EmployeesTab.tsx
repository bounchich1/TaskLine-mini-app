import { Button, Input } from '@maxhub/max-ui';
import { clsx } from 'clsx';
import { useState } from 'react';

import { AdminCard } from '@/features/admin/components/AdminCard/AdminCard';
import { EMPLOYEE_STATUS_OPTIONS } from '@/shared/config/labels';
import type { Employee, EmployeeStatus, Session } from '@/shared/types/api';
import { Empty, Icon } from '@/shared/ui';

import { EmployeeRow } from '../EmployeeRow/EmployeeRow';

import './EmployeesTab.scss';

type StatusFilter = EmployeeStatus | 'all';

const FILTERS: readonly (readonly [StatusFilter, string])[] = [['all', 'Все'], ...EMPLOYEE_STATUS_OPTIONS];

type EmployeesTabProps = {
    employees: Employee[] | undefined;
    session: Session;
    busy: boolean;
    onEdit: (employee: Employee | null) => void;
    onBlock: (employee: Employee) => void;
    onUnblock: (employee: Employee) => void;
};

function matches(employee: Employee, query: string) {
    const needle = query.trim().toLocaleLowerCase('ru');

    return (
        !needle || employee.name.toLocaleLowerCase('ru').includes(needle) || !!employee.max_user_id?.includes(needle)
    );
}

export function EmployeesTab({ employees = [], session, busy, onEdit, onBlock, onUnblock }: EmployeesTabProps) {
    const [status, setStatus] = useState<StatusFilter>('all');
    const [query, setQuery] = useState('');
    const found = employees.filter((employee) => matches(employee, query));
    const visible = found.filter((employee) => status === 'all' || employee.status === status);
    const count = (filter: StatusFilter) => found.filter((item) => filter === 'all' || item.status === filter).length;

    return (
        <AdminCard
            title="Сотрудники"
            action={
                <Button
                    size="xsmall"
                    onClick={() => {
                        setStatus('all');
                        onEdit(null);
                    }}
                >
                    Добавить сотрудника
                </Button>
            }
        >
            <div className="employees-toolbar">
                <Input
                    size="medium"
                    aria-label="Поиск по имени или MAX ID"
                    placeholder="Имя или MAX ID"
                    value={query}
                    onChange={(event) => {
                        setQuery(event.target.value);
                    }}
                    iconBefore={<Icon name="search" size={18} />}
                />

                <div className="employees-filter" role="tablist" aria-label="Статус сотрудников">
                    {FILTERS.map(([value, label]) => (
                        <button
                            role="tab"
                            key={value}
                            aria-selected={status === value}
                            className={clsx(
                                'employees-filter__tab',
                                status === value && 'employees-filter__tab--selected',
                            )}
                            onClick={() => {
                                setStatus(value);
                            }}
                        >
                            {label}
                            <span className="employees-filter__count">{count(value)}</span>
                        </button>
                    ))}
                </div>
            </div>

            {visible.length ? (
                <div className="admin-card__list">
                    {visible.map((employee) => (
                        <EmployeeRow
                            key={employee.id}
                            employee={employee}
                            session={session}
                            busy={busy}
                            onEdit={onEdit}
                            onBlock={onBlock}
                            onUnblock={onUnblock}
                        />
                    ))}
                </div>
            ) : (
                <Empty title={query ? 'Никого не нашли' : 'В этом списке пока никого нет'} />
            )}
        </AdminCard>
    );
}
