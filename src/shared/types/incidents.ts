export type IncidentStatus = 'suggested' | 'open' | 'resolved' | 'dismissed';

type IncidentDetection = {
    count: number;
    baseline: number;
    window_minutes: number;
    terms: string[];
    ticket_ids: string[];
    cluster_ids: string[];
};

export type Incident = {
    id: string;
    title: string;
    tag: string;
    tag_label: string;
    status: IncidentStatus;
    public_message: string;
    final_message: string;
    eta: string | null;
    match_terms: string[];
    request_rating: boolean;
    detection: IncidentDetection | null;
    linked: number;
    linked_open: number;
    linked_auto: number;
    messages_sent: number;
    created_by_name: string | null;
    created_at: string;
    opened_at: string | null;
    resolved_at: string | null;
    dismissed_at: string | null;
    updated_at: string;
    version: number;
};

export type IncidentUpdateKind = 'opened' | 'message' | 'eta' | 'resolved' | 'reopened' | 'dismissed';

export type IncidentUpdate = {
    id: string;
    kind: IncidentUpdateKind;
    text: string;
    eta: string | null;
    broadcast: boolean;
    recipients: number;
    finished_at: string | null;
    author_name: string | null;
    created_at: string;
};

export type IncidentCandidate = {
    id: string;
    number: string;
    description: string;
    status: 'open' | 'in_progress' | 'awaiting_rating' | 'closed';
    created_at: string;
    in_cluster: boolean;
    linked_elsewhere: boolean;
};

export type IncidentDetail = Incident & {
    updates: IncidentUpdate[];
    candidates: IncidentCandidate[];
};

export type IncidentList = {
    items: Incident[];
    counts: { suggested: number; open: number; resolved: number };
};

export type IncidentSettings = {
    detection: boolean;
    auto_link: boolean;
    window_minutes: number;
    min_tickets: number;
    spike_factor: number;
    relink_hours: number;
    version: number;
};

export type IncidentLinkResult = {
    incident: Incident;
    linked?: string[];
    skipped?: { id: string; reason: 'not_found' | 'ticket_closed' | 'other_incident' }[];
};
