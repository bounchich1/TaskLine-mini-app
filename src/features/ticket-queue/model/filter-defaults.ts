import { dayBoundary } from '@/shared/lib/day-boundary';

export type QueueTab = 'open' | 'closed';

export type Filters = {
    tab: QueueTab;
    q: string;
    tag: string;
    urgency: string;
    complexity: string;
    status: string;
    assignee: string;
    sla: string;
    from: string;
    to: string;
    sort: string;
};

export const FILTER_FIELDS = [
    'tag',
    'urgency',
    'complexity',
    'status',
    'assignee',
    'sla',
    'from',
    'to',
] as const satisfies readonly (keyof Filters)[];

export const DEFAULT_FILTERS: Filters = {
    tab: 'open',
    q: '',
    tag: '',
    urgency: '',
    complexity: '',
    status: '',
    assignee: '',
    sla: '',
    from: '',
    to: '',
    sort: 'sla_risk',
};

export function filtersQuery(filters: Filters, timezone: string): string {
    const params = new URLSearchParams();

    for (const [name, value] of Object.entries(filters)) {
        if (!value) {
            continue;
        }

        if (name === 'from' || name === 'to') {
            params.set(name, dayBoundary(value, timezone, name === 'to'));
        } else {
            params.set(name, value);
        }
    }

    return params.toString();
}
