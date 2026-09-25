const ORG = { name: 'ООО «Линия»', timezone: 'Asia/Krasnoyarsk' };

const ME = {
    id: 'e1',
    name: 'Анна Смирнова',
    role: 'admin',
    blocked: false,
    version: 3,
    max_user_id: '1001',
};

export const EMPLOYEES = [
    ME,
    {
        id: 'e2',
        name: 'Борис Иванов',
        role: 'support',
        blocked: false,
        version: 1,
        max_user_id: '1002',
    },
    {
        id: 'e3',
        name: 'Вера Петрова',
        role: 'supervisor',
        blocked: true,
        version: 2,
        max_user_id: '1003',
    },
];

export const SESSION = {
    token: 'token',
    csrf: 'csrf',
    employee: ME,
    organization: ORG,
    capabilities: { support: true, admin: true, act_on_others: true, operations: true },
};

export const DICTIONARIES = [
    { dimension: 'tag', code: 'undefined', label: 'Не определён', rank: 0, active: true, version: 1 },
    { dimension: 'tag', code: 'network', label: 'Сеть', rank: 5, active: true, version: 2 },
    { dimension: 'tag', code: 'billing', label: 'Оплата', rank: 3, active: false, version: 4 },
    { dimension: 'urgency', code: 'low', label: 'Низкая', rank: 0, active: true, version: 1 },
    { dimension: 'urgency', code: 'medium', label: 'Средняя', rank: 1, active: true, version: 1 },
    { dimension: 'urgency', code: 'high', label: 'Высокая', rank: 2, active: true, version: 1 },
    {
        dimension: 'urgency',
        code: 'critical',
        label: 'Критическая',
        rank: 3,
        active: true,
        version: 1,
    },
    { dimension: 'complexity', code: 'low', label: 'Низкая', rank: 0, active: true, version: 1 },
    { dimension: 'complexity', code: 'medium', label: 'Средняя', rank: 1, active: true, version: 1 },
    { dimension: 'complexity', code: 'high', label: 'Высокая', rank: 2, active: true, version: 1 },
];

const labels = { network: 'Сеть', undefined: 'Не определён', billing: 'Оплата' };
const levels = { low: 'Низкая', medium: 'Средняя', high: 'Высокая', critical: 'Критическая' };

function ticket(overrides: Record<string, unknown>) {
    const tag = (overrides.tag as keyof typeof labels | undefined) ?? 'network';
    const urgency = (overrides.urgency as keyof typeof levels | undefined) ?? 'medium';
    const complexity = (overrides.complexity as keyof typeof levels | undefined) ?? 'low';

    return {
        id: 't1',
        number: '000001',
        ticket_number: 1,
        description: 'Не работает интернет с утра, роутер перезагружали.',
        status: 'open',
        assignee_id: null,
        assignee_name: null,
        version: 4,
        created_at: '2026-03-02T02:15:00Z',
        taken_at: null,
        closed_at: null,
        tag,
        urgency,
        complexity,
        tag_label: labels[tag],
        urgency_label: levels[urgency],
        complexity_label: levels[complexity],
        tag_revision: 0,
        urgency_revision: 0,
        complexity_revision: 0,
        ai_status: 'done',
        review_required: false,
        suggestion: null,
        suggestion_stale: false,
        rating: null,
        rated_at: null,
        closures: [],
        attachments: [],
        ...overrides,
    };
}

export const OPEN_TICKETS = [
    ticket({ id: 't1', number: '000001', urgency: 'critical' }),
    ticket({
        id: 't2',
        number: '000002',
        status: 'in_progress',
        assignee_id: 'e1',
        assignee_name: 'Анна Смирнова',
        taken_at: '2026-03-02T03:00:00Z',
        description: 'Списали оплату дважды за один месяц.',
        tag: 'billing',
        urgency: 'high',
        complexity: 'medium',
        review_required: true,
        suggestion: {
            tags: { tag: 'billing', urgency: 'high', complexity: 'medium' },
            suggested_solution: 'Проверьте историю платежей и оформите возврат второго списания.',
            needs_review: false,
            missing_information: ['Дата второго списания', 'Последние 4 цифры карты'],
            evidence_memory_ids: ['m1', 'm2'],
            confidence: 0.8,
        },
        attachments: [
            {
                id: 'a1',
                message_id: 'msg1',
                filename: 'чек.pdf',
                status: 'clean',
                mime: 'application/pdf',
                bytes: '20480',
                kind: 'file',
                extraction_status: 'complete',
            },
        ],
    }),
    ticket({
        id: 't3',
        number: '000003',
        ai_status: 'pending',
        description: 'Не приходит код подтверждения.',
        created_at: '2026-03-02T04:40:00Z',
    }),
];

export const CLOSED_TICKETS = [
    ticket({
        id: 't9',
        number: '000009',
        status: 'closed',
        assignee_id: 'e2',
        assignee_name: 'Борис Иванов',
        rating: 9,
        rated_at: '2026-03-01T10:00:00Z',
        closed_at: '2026-03-01T09:00:00Z',
        closures: [
            {
                id: 'c1',
                cycle_no: 1,
                closed_at: '2026-03-01T09:00:00Z',
                rating: 9,
                rated_at: '2026-03-01T10:00:00Z',
                finished_reason: null,
                learning_status: 'learned',
                invalidated: false,
                coverage: { message_count: 6, missing_attachments: [], complete_text_coverage: true },
            },
        ],
    }),
];

export const MESSAGES = [
    {
        id: 'msg1',
        seq: 1,
        author_type: 'client',
        author_name: null,
        text: 'Списали оплату дважды за один месяц.',
        created_at: '2026-03-02T02:15:00Z',
        delivery_state: 'received',
        deleted: false,
        revision: 1,
    },
    {
        id: 'msg2',
        seq: 2,
        author_type: 'bot',
        author_name: null,
        text: 'Обращение №000002 зарегистрировано.',
        created_at: '2026-03-02T02:15:05Z',
        delivery_state: 'delivered',
        deleted: false,
        revision: 1,
    },
    {
        id: 'msg3',
        seq: 3,
        author_type: 'staff',
        author_name: 'Анна Смирнова',
        text: 'Проверяем платёж, ответим в течение часа.',
        created_at: '2026-03-02T03:05:00Z',
        delivery_state: 'delivered',
        deleted: false,
        revision: 1,
    },
    {
        id: 'msg4',
        seq: 4,
        author_type: 'staff',
        author_name: 'Анна Смирнова',
        text: 'Уточните, пожалуйста, дату списания.',
        created_at: '2026-03-02T03:10:00Z',
        delivery_state: 'failed',
        deleted: false,
        revision: 1,
    },
];

export const NOTIFICATIONS = [
    {
        id: 'n1',
        type: 'ticket.created',
        ticket_id: 't3',
        read_at: null,
        created_at: '2026-03-02T04:40:00Z',
    },
    {
        id: 'n2',
        type: 'rating.received',
        ticket_id: 't9',
        read_at: '2026-03-01T11:00:00Z',
        created_at: '2026-03-01T10:00:00Z',
    },
];

export const TEMPLATES = [
    { code: 'ticket_created', body: 'Обращение №{ticket_number} зарегистрировано.', version: 2 },
    { code: 'consent_request', body: 'Согласны на обработку данных? {policy_url}', version: 1 },
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
    jobs: [{ id: 'j1', kind: 'scan', state: 'failed', reason: 'worker_error' }],
    memory: [],
};

export const AUDIT = [{ id: 'au1', action: 'admin.settings', object_id: 'org', created_at: '2026-03-01T08:00:00Z' }];
