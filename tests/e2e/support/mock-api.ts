import type { Page, Request, Route } from '@playwright/test';

import {
  AUDIT,
  CLOSED_TICKETS,
  DICTIONARIES,
  DIAGNOSTICS,
  EMPLOYEES,
  MESSAGES,
  NOTIFICATIONS,
  OPEN_TICKETS,
  SESSION,
  SETTINGS,
  TEMPLATES,
} from './fixtures';

export interface RecordedCall {
  method: string;
  path: string;
  search: URLSearchParams;
  headers: Record<string, string>;
  body: unknown;
}

type Handler = (call: RecordedCall) => unknown;

const byId = (id: string) => [...OPEN_TICKETS, ...CLOSED_TICKETS].find((item) => item.id === id);

/** Page 1 of the open queue has two tickets and a cursor; page 2 has the third. */
function ticketPage(search: URLSearchParams) {
  const counts = { open: OPEN_TICKETS.length, closed: CLOSED_TICKETS.length };
  if (search.get('tab') === 'closed') {
    return { items: CLOSED_TICKETS, counts, next_cursor: null, cursor: '1' };
  }
  const query = search.get('q') ?? '';
  const matching = OPEN_TICKETS.filter(
    (item) => item.number.includes(query) || item.description.includes(query),
  );
  if (search.get('cursor') === 'page-2') {
    return { items: matching.slice(2), counts, next_cursor: null, cursor: '1' };
  }
  const nextCursor = matching.length > 2 ? 'page-2' : null;
  return { items: matching.slice(0, 2), counts, next_cursor: nextCursor, cursor: '1' };
}

const GET_ROUTES: [RegExp, Handler][] = [
  [/^\/v1\/dictionaries$/, () => ({ items: DICTIONARIES })],
  [/^\/v1\/employees$/, () => ({ items: EMPLOYEES })],
  [/^\/v1\/notifications$/, () => ({ items: NOTIFICATIONS })],
  [/^\/v1\/tickets$/, (call) => ticketPage(call.search)],
  [/^\/v1\/tickets\/[^/]+\/messages$/, () => ({ items: MESSAGES, has_more: false, next_before: 0 })],
  [/^\/v1\/tickets\/[^/]+$/, (call) => byId(call.path.split('/')[3] ?? '')],
  [/^\/v1\/admin\/employees$/, () => ({ items: EMPLOYEES })],
  [/^\/v1\/admin\/templates$/, () => ({ items: TEMPLATES })],
  [/^\/v1\/admin\/settings$/, () => SETTINGS],
  [/^\/v1\/admin\/diagnostics$/, () => DIAGNOSTICS],
  [/^\/v1\/admin\/audit$/, () => ({ items: AUDIT })],
];

function mutationResult(call: RecordedCall): unknown {
  if (call.path === '/v1/auth/dev') {
    return SESSION;
  }
  const command = /^\/v1\/tickets\/([^/]+)\/(\w+)$/.exec(call.path);
  if (command) {
    return byId(command[1] ?? '');
  }
  return { ok: true };
}

/**
 * Serves every /v1 request from fixtures and records it. The event stream is refused, so the
 * app stays in its "reconnecting" state and never refreshes on its own during a test.
 */
export class MockApi {
  readonly calls: RecordedCall[] = [];
  private readonly overrides: { method: string; path: RegExp; status: number }[] = [];

  static async install(page: Page): Promise<MockApi> {
    const mock = new MockApi();
    // The MAX bridge script is not needed in demo mode.
    await page.route('https://st.max.ru/**', (route) =>
      route.fulfill({ contentType: 'text/javascript', body: '' }),
    );
    await page.route('**/v1/**', (route, request) => mock.handle(route, request));
    return mock;
  }

  /** The next matching request fails with `status` (e.g. 503 to exercise retries). */
  failNext(method: string, path: RegExp, status: number): void {
    this.overrides.push({ method, path, status });
  }

  callsTo(method: string, path: string | RegExp): RecordedCall[] {
    return this.calls.filter(
      (call) =>
        call.method === method &&
        (typeof path === 'string' ? call.path === path : path.test(call.path)),
    );
  }

  private async handle(route: Route, request: Request): Promise<void> {
    const url = new URL(request.url());
    if (url.pathname === '/v1/events') {
      await route.abort();
      return;
    }
    const call: RecordedCall = {
      method: request.method(),
      path: url.pathname,
      search: url.searchParams,
      headers: request.headers(),
      body: parseBody(request),
    };
    this.calls.push(call);
    const override = this.overrides.findIndex(
      (item) => item.method === call.method && item.path.test(call.path),
    );
    if (override >= 0) {
      const [{ status }] = this.overrides.splice(override, 1) as [{ status: number }];
      await route.fulfill({ status, json: { code: 'test_failure', message: `HTTP ${status}` } });
      return;
    }
    const body = call.method === 'GET' ? this.read(call) : mutationResult(call);
    await route.fulfill({ status: body === undefined ? 404 : 200, json: body ?? {} });
  }

  private read(call: RecordedCall): unknown {
    const handler = GET_ROUTES.find(([pattern]) => pattern.test(call.path))?.[1];
    return handler?.(call);
  }
}

function parseBody(request: Request): unknown {
  const data = request.postData();
  if (!data) {
    return undefined;
  }
  try {
    return JSON.parse(data) as unknown;
  } catch {
    return data;
  }
}
