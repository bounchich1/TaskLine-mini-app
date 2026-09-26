export type Role = 'support' | 'supervisor' | 'admin';

export type EmployeeStatus = 'pending' | 'active' | 'blocked';

export type Permission =
    | 'tickets.view'
    | 'tickets.work'
    | 'tickets.classify_any'
    | 'tickets.reply_any'
    | 'tickets.transfer_any'
    | 'tickets.close_any'
    | 'tickets.reopen_any'
    | 'deliveries.resolve_unknown'
    | 'operations.view'
    | 'operations.retry'
    | 'employees.manage'
    | 'organization.configure'
    | 'audit.view';

export type Employee = {
    id: string;
    name: string;
    role: Role;
    status: EmployeeStatus;
    version: number;
    max_user_id?: string;
    activated_at?: string | null;
};

export type Session = {
    token: string;
    csrf: string;
    employee: Employee;
    organization: { name: string; timezone: string };
    permissions: Permission[];
    start_param?: string | null;
};

export type Dictionary = {
    dimension: 'tag' | 'urgency' | 'complexity';
    code: string;
    label: string;
    rank: number;
    active: boolean;
    version: number;
};

type SuggestionBase = {
    tags: { tag: string; urgency: string; complexity: string };
    needs_review: boolean;
    missing_information: string[];
    evidence_memory_ids: string[];
    confidence: number;
};

type TipStep = { text: string; case_refs: string[] };

export type Tip = { summary: string; steps: TipStep[]; cautions: string[] };

type LegacySuggestion = SuggestionBase & {
    schema_version?: '1.0';
    suggested_solution: string | null;
};

export type TerseSuggestion = SuggestionBase & {
    schema_version: '1.1';
    tip: Tip | null;
    customer_reply: string | null;
};

export type Suggestion = LegacySuggestion | TerseSuggestion;

type SourceState = 'ok' | 'reopened' | 'outdated' | 'gone';

export type SuggestionSource = {
    memory_id: string;
    state: SourceState;
    ticket_id: string | null;
    number: string | null;
    problem: string | null;
    closed_at: string | null;
};

export type Attachment = {
    id: string;
    message_id: string | null;
    filename: string;
    status: string;
    mime: string;
    bytes: string;
    kind: string;
    extraction_status: string;
};

export type Closure = {
    id: string;
    cycle_no: number;
    closed_at: string;
    rating: number | null;
    rated_at: string | null;
    finished_reason: string | null;
    learning_status: string;
    invalidated: boolean;
    coverage: {
        message_count?: number;
        missing_attachments?: string[];
        complete_text_coverage?: boolean;
    } | null;
};

export type Ticket = {
    id: string;
    number: string;
    ticket_number: number;
    description: string;
    status: 'open' | 'in_progress' | 'awaiting_rating' | 'closed';
    assignee_id: string | null;
    assignee_name: string | null;
    version: number;
    created_at: string;
    taken_at: string | null;
    closed_at: string | null;
    tag: string;
    urgency: string;
    complexity: string;
    tag_label: string;
    urgency_label: string;
    complexity_label: string;
    tag_revision: number;
    urgency_revision: number;
    complexity_revision: number;
    ai_status: string;
    review_required: boolean;
    suggestion: Suggestion | null;
    suggestion_sources?: SuggestionSource[];
    suggestion_stale: boolean;
    rating: number | null;
    rated_at: string | null;
    closures?: Closure[];
    attachments?: Attachment[];
};

export type Message = {
    id: string;
    seq: number;
    author_type: 'client' | 'staff' | 'bot' | 'system';
    author_name: string | null;
    text: string;
    created_at: string;
    delivery_state: string;
    deleted: boolean;
    revision: number;
};

export type SourceExcerpt = {
    source: {
        memory_id: string;
        state: SourceState;
        ticket_id: string;
        number: string;
        cycle_no: number;
        closed_at: string;
        problem: string | null;
        solution: string | null;
    };
    messages: Message[];
    attachments: Attachment[];
    highlight: string[];
    truncated: boolean;
};

export type TicketPage = {
    items: Ticket[];
    counts: { open: number; closed: number };
    next_cursor: string | null;
    cursor: string;
};

export type Notification = {
    id: string;
    type: string;
    ticket_id: string;
    read_at: string | null;
    created_at: string;
};
