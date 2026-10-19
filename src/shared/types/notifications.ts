import type { SlaClock, SlaFields, Ticket } from './api';

export type NotificationTicket = Pick<
    Ticket,
    | 'id'
    | 'number'
    | 'status'
    | 'description'
    | 'tag'
    | 'tag_label'
    | 'urgency'
    | 'urgency_label'
    | 'ai_status'
    | 'assignee_id'
    | 'assignee_name'
    | 'rating'
    | 'purged_at'
> &
    SlaFields;

export type Notification = {
    id: string;
    type: string;
    ticket_id: string | null;
    read_at: string | null;
    created_at: string;
    payload: {
        value?: number;
        comment?: string;
        topic?: boolean;
        clock?: SlaClock;
        stage?: number;
        reason?: string;
        incident_id?: string;
        count?: number;
        baseline?: number;
        label?: string;
    };
    preview: string | null;
    actor_name: string | null;
    ticket: NotificationTicket | null;
};

export type NotificationSettings = {
    new_tickets: 'all' | 'topics' | 'off';
    topics: string[];
    max_alerts: boolean;
};
