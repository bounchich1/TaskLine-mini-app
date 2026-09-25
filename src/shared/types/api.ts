export type Employee = {
    id: string;
    name: string;
    role: 'support' | 'supervisor' | 'admin';
    blocked: boolean;
    version: number;
    max_user_id?: string;
};

export type Session = {
    token: string;
    csrf: string;
    employee: Employee;
    organization: { name: string; timezone: string };
    capabilities: { support: boolean; admin: boolean; act_on_others: boolean; operations: boolean };
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

export type Suggestion = {
    tags: { tag: string; urgency: string; complexity: string };
    suggested_solution: string | null;
    needs_review: boolean;
    missing_information: string[];
    evidence_memory_ids: string[];
    confidence: number;
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
