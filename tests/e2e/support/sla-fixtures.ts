import { ORG } from './staff';

const MINUTE = 60000;

export const SLA_NOW = Date.parse('2026-03-02T04:00:00Z');

const fromNow = (minutes: number) => new Date(SLA_NOW + minutes * MINUTE).toISOString();
const RESPONSE_LATE = fromNow(-30);
const RESOLUTION_DUE = fromNow(180);

export const LATE_RESPONSE = {
    sla_first_response_minutes: 15,
    sla_resolution_minutes: 240,
    first_response_due_at: RESPONSE_LATE,
    first_responded_at: null,
    resolution_due_at: RESOLUTION_DUE,
    sla_breached: ['first_response'],
    sla_due_at: RESPONSE_LATE,
    sla_warn_at: fromNow(-45),
};

export const RESOLUTION_ON_TRACK = {
    sla_first_response_minutes: 30,
    sla_resolution_minutes: 480,
    first_response_due_at: fromNow(-240),
    first_responded_at: fromNow(-250),
    resolution_due_at: RESOLUTION_DUE,
    sla_breached: [],
    sla_due_at: RESOLUTION_DUE,
    sla_warn_at: fromNow(120),
};

const OFFICE: [string, string][] = [['09:00', '18:00']];

export const SLA_CONFIG = {
    enabled: true,
    timezone: ORG.timezone,
    week: {
        1: OFFICE,
        2: OFFICE,
        3: OFFICE,
        4: OFFICE,
        5: [
            ['09:00', '13:00'],
            ['14:00', '17:00'],
        ],
        6: [],
        7: [],
    },
    holidays: ['2026-11-04'],
    workdays: [],
    notify_max: false,
    client_eta: false,
    waiting_reminder_hours: 24,
    waiting_close_hours: 72,
    policies: [
        { urgency: 'critical', tag: '*', first_response_minutes: 15, resolution_minutes: 240 },
        { urgency: 'high', tag: '*', first_response_minutes: 30, resolution_minutes: 480 },
        { urgency: 'medium', tag: '*', first_response_minutes: 60, resolution_minutes: 960 },
        { urgency: 'high', tag: 'network', first_response_minutes: 20, resolution_minutes: 240 },
    ],
    version: 3,
};
