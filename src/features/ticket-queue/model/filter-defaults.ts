import { dayBoundary } from '@/shared/lib/day-boundary';

export type QueueTab = 'open' | 'closed';

/** Queue filters, in the order they appear in the request's query string. */
export type Filters = {
  tab: QueueTab;
  q: string;
  tag: string;
  urgency: string;
  complexity: string;
  status: string;
  assignee: string;
  from: string;
  to: string;
  sort: string;
};

/** The fields of the filter panel (search, tab and sort are set elsewhere). */
export const FILTER_FIELDS = [
  'tag',
  'urgency',
  'complexity',
  'status',
  'assignee',
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
  from: '',
  to: '',
  sort: 'urgency',
};

/** The query string of GET /v1/tickets; dates become the organization's day boundaries. */
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
