export const ORG = { name: 'ООО «Линия»', timezone: 'Asia/Krasnoyarsk' };

const ME = {
    id: 'e1',
    name: 'Анна Смирнова',
    role: 'admin',
    status: 'active',
    activated_at: '2026-02-01T08:00:00Z',
    version: 3,
    max_user_id: '1001',
};

const BORIS = {
    id: 'e2',
    name: 'Борис Иванов',
    role: 'support',
    status: 'active',
    activated_at: '2026-02-02T08:00:00Z',
    version: 1,
    max_user_id: '1002',
};

export const EMPLOYEES = [
    ME,
    BORIS,
    {
        id: 'e3',
        name: 'Вера Петрова',
        role: 'supervisor',
        status: 'blocked',
        activated_at: '2026-02-03T08:00:00Z',
        version: 2,
        max_user_id: '1003',
    },
    {
        id: 'e4',
        name: 'Галина Орлова',
        role: 'support',
        status: 'pending',
        activated_at: null,
        version: 1,
        max_user_id: '1004',
    },
    {
        id: 'e5',
        name: 'Дмитрий Козлов',
        role: 'admin',
        status: 'active',
        activated_at: '2026-02-04T08:00:00Z',
        version: 4,
        max_user_id: '1005',
    },
];

const SUPPORT_PERMISSIONS = ['tickets.view', 'tickets.work'];

const SUPERVISOR_PERMISSIONS = [
    ...SUPPORT_PERMISSIONS,
    'tickets.classify_any',
    'tickets.reply_any',
    'tickets.transfer_any',
    'tickets.close_any',
    'tickets.reopen_any',
    'deliveries.resolve_unknown',
    'operations.view',
    'operations.retry',
];

export const SESSION = {
    token: 'token',
    csrf: 'csrf',
    employee: ME,
    organization: ORG,
    permissions: [...SUPERVISOR_PERMISSIONS, 'employees.manage', 'organization.configure', 'audit.view'],
};

export const SUPPORT_SESSION = { ...SESSION, employee: BORIS, permissions: SUPPORT_PERMISSIONS };

export const SUPERVISOR_SESSION = {
    ...SESSION,
    employee: { ...BORIS, id: 'e6', name: 'Олег Руководитель', role: 'supervisor' },
    permissions: SUPERVISOR_PERMISSIONS,
};
