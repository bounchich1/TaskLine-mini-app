import { ORG } from './staff';

export const TEMPLATES = [
    {
        code: 'ticket_created',
        body: 'Обращение №{ticket_number} зарегистрировано.',
        default_body: 'Обращение №{ticket_number} создано. Сотрудник поддержки скоро ответит.',
        version: 2,
    },
    {
        code: 'consent_request',
        body: 'Согласны на обработку данных? {policy_url}',
        default_body: 'Согласны на обработку данных? {policy_url}',
        version: 1,
    },
];

export const SETTINGS = { name: ORG.name, timezone: ORG.timezone, version: 5 };

export const DIAGNOSTICS = {
    permits: [
        { slot: 1, state: 'free' },
        { slot: 2, state: 'running' },
        { slot: 3, state: 'uncertain' },
    ],
    deliveries: [
        {
            id: 'd1',
            ticket_id: 't2',
            message_id: 'msg4',
            kind: 'staff',
            state: 'unknown',
            reason: 'worker_lost',
        },
    ],
    jobs: [
        { id: 'j1', kind: 'scan', state: 'failed', reason: 'worker_error' },
        { id: 'j2', kind: 'triage', ticket_id: 't1', state: 'failed', reason: 'ai_timeout' },
    ],
    memory: [],
};

export const AUDIT = [{ id: 'au1', action: 'admin.settings', object_id: 'org', created_at: '2026-03-01T08:00:00Z' }];
