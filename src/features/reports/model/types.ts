export type ReportName = 'overview' | 'team' | 'topics' | 'ai' | 'quality';

type ReportPeriod = {
    from: string;
    to: string;
    previous_from: string;
    previous_to: string;
    timezone: string;
};

type ReportBase = {
    period: ReportPeriod;
    refreshed_at: string | null;
};

export type OverviewMetrics = {
    created: number;
    closed: number;
    open_end: number;
    response_p50: number | null;
    response_p90: number | null;
    resolution_p50: number | null;
    resolution_p90: number | null;
    assignment_p50: number | null;
    csat: number | null;
    rated: number;
    promoters: number | null;
    detractors: number | null;
    rating_response: number | null;
    reopen_rate: number | null;
    sla_response: number | null;
    sla_resolution: number | null;
};

export type TrendPoint = { day: string; created: number; closed: number; open_end: number };

export type OverviewReport = ReportBase & {
    report: 'overview';
    business_hours: boolean;
    current: OverviewMetrics;
    previous: OverviewMetrics;
    trend: TrendPoint[];
};

export type TeamRow = {
    employee_id: string;
    name: string;
    role: string;
    presence: 'online' | 'break' | 'offline';
    blocked: boolean;
    taken: number;
    closed: number;
    active: number;
    capacity: number;
    responded: number;
    response_p50: number | null;
    resolution_p50: number | null;
    csat: number | null;
    rated: number;
    reopen_rate: number | null;
    transfers_out: number;
    online_seconds: number;
    ai_draft_share: number | null;
    macro_share: number | null;
};

export type TeamReport = ReportBase & {
    report: 'team';
    business_hours: boolean;
    min_sample: number;
    items: TeamRow[];
};

export type TopicRow = {
    code: string;
    label: string;
    active: boolean;
    created: number;
    previous: number;
    growth: number | null;
    closed: number;
    resolution_p50: number | null;
    csat: number | null;
    rated: number;
    series: number[];
};

export type TopicsReport = ReportBase & {
    report: 'topics';
    business_hours: boolean;
    days: string[];
    items: TopicRow[];
    fastest_growing: string[];
};

type Count = { reason: string; count: number };

type CallStats = {
    kind: string;
    calls: number;
    success_rate: number | null;
    p50: number | null;
    p95: number | null;
    prompt_tokens: number;
    completion_tokens: number;
    reasoning_tokens: number;
    cached_tokens: number;
};

export type AiReport = ReportBase & {
    report: 'ai';
    accuracy: {
        classified: number;
        tag: number | null;
        urgency: number | null;
        complexity: number | null;
        all: number | null;
    };
    review: { triaged: number; rate: number | null };
    drafts: {
        replies: number;
        ai_share: number | null;
        macro_share: number | null;
        ticket_share: number | null;
        edit_p50: number | null;
    };
    grounding: {
        tipped: number;
        share: number | null;
        grounded_resolution_p50: number | null;
        ungrounded_resolution_p50: number | null;
    };
    knowledge: {
        eligible_records: number;
        learned: number;
        recall_hits: number | null;
        weekly: { week: string; learned: number }[];
    };
    engagement: {
        tip_views: number;
        tip_viewed_tickets: number;
        drafts_inserted: number;
        sources_opened: number;
    };
    triage: { p50: number | null; p95: number | null; runs: number; success_rate: number | null; failures: Count[] };
    calls: CallStats[];
    call_failures: Count[];
    cost: { prompt_tokens: number; completion_tokens: number; currency: string; amount: number | null };
};

type QualityRow = {
    ticket_id: string;
    lifecycle: number;
    number: string;
    tag: string;
    tag_label: string;
    assignee_id: string | null;
    assignee_name: string | null;
    rating: number;
    closed_at: string;
    purged: boolean;
};

export type QualityReport = ReportBase & {
    report: 'quality';
    threshold: number;
    items: QualityRow[];
};

export type ReportByName = {
    overview: OverviewReport;
    team: TeamReport;
    topics: TopicsReport;
    ai: AiReport;
    quality: QualityReport;
};
