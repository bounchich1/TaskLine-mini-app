const base = {
    tag: 'network',
    tag_label: 'Сеть',
    final_message: '',
    eta: null,
    request_rating: false,
    created_by_name: null,
    created_at: '2026-03-02T03:40:00Z',
    opened_at: null,
    resolved_at: null,
    dismissed_at: null,
    updated_at: '2026-03-02T03:58:00Z',
    version: 1,
};

const SUGGESTION = {
    ...base,
    id: 'inc1',
    title: 'Сеть — ул. Ленина',
    status: 'suggested',
    public_message: 'Мы знаем о массовой проблеме («Сеть») и уже работаем над ней.',
    match_terms: ['ул. Ленина', 'интернета'],
    detection: {
        count: 12,
        baseline: 1.5,
        window_minutes: 15,
        terms: ['ул. Ленина', 'интернета'],
        ticket_ids: ['t1', 't2'],
        cluster_ids: ['t1'],
    },
    linked: 0,
    linked_open: 0,
    linked_auto: 0,
    messages_sent: 0,
};

const OPEN_INCIDENT = {
    ...base,
    id: 'inc2',
    title: 'Авария на ул. Мира',
    status: 'open',
    public_message: 'Бригада уже на месте.',
    match_terms: ['ул. Мира'],
    detection: null,
    linked: 2,
    linked_open: 2,
    linked_auto: 1,
    messages_sent: 2,
    created_by_name: 'Анна Смирнова',
    opened_at: '2026-03-02T03:10:00Z',
    version: 3,
};

const INCIDENTS = [SUGGESTION, OPEN_INCIDENT];

const CANDIDATES = [
    {
        id: 't1',
        number: '000001',
        description: 'Нет интернета на ул. Ленина',
        status: 'open',
        created_at: '2026-03-02T03:50:00Z',
        in_cluster: true,
        linked_elsewhere: false,
    },
    {
        id: 't2',
        number: '000002',
        description: 'Медленный интернет вечером',
        status: 'in_progress',
        created_at: '2026-03-02T03:45:00Z',
        in_cluster: false,
        linked_elsewhere: false,
    },
];

const UPDATES = [
    {
        id: 'u1',
        kind: 'opened',
        text: 'Бригада уже на месте.',
        eta: null,
        broadcast: true,
        recipients: 2,
        finished_at: '2026-03-02T03:11:00Z',
        author_name: 'Анна Смирнова',
        created_at: '2026-03-02T03:10:00Z',
    },
];

const SETTINGS = {
    detection: true,
    auto_link: false,
    window_minutes: 15,
    min_tickets: 8,
    spike_factor: 4,
    relink_hours: 6,
    version: 2,
};

function detail(id: string) {
    const incident = INCIDENTS.find((item) => item.id === id);

    return (
        incident && { ...incident, updates: id === 'inc2' ? UPDATES : [], candidates: id === 'inc1' ? CANDIDATES : [] }
    );
}

export function incidentGet(path: string, search: URLSearchParams): unknown {
    if (path === '/v1/incidents') {
        const status = search.get('status');

        return {
            items: INCIDENTS.filter((item) => !status || item.status === status),
            counts: { suggested: 1, open: 1, resolved: 0 },
        };
    }

    return path === '/v1/incidents/settings' ? SETTINGS : detail(path.split('/')[3] ?? '');
}

export function incidentMutation(path: string, body: unknown): unknown {
    if (path === '/v1/incidents/settings') {
        return { ...(body as object), version: SETTINGS.version + 1 };
    }

    if (path === '/v1/incidents' || path.endsWith('/tickets')) {
        return { incident: OPEN_INCIDENT, linked: ['t1'], skipped: [{ id: 't2', reason: 'other_incident' }] };
    }

    return { incident: OPEN_INCIDENT };
}
