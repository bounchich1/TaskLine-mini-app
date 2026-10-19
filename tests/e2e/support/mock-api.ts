import type { Page, Request, Route } from '@playwright/test';

import { AUDIT, DIAGNOSTICS, SETTINGS, TEMPLATES } from './admin-fixtures';
import { BOT, PRESETS, presetPreview, PROFILE } from './business-fixtures';
import { CLOSED_TICKETS, DICTIONARIES, MESSAGES, OPEN_TICKETS } from './fixtures';
import { solidPng } from './media';
import { NOTIFICATIONS } from './notification-fixtures';
import { MACROS, REPORTS, RULES, TEAMS } from './routing-fixtures';
import { SLA_CONFIG, SLA_NOW } from './sla-fixtures';
import { SOURCE_EXCERPT } from './source-fixtures';
import { EMPLOYEES, SESSION } from './staff';

export const MEDIA_WIDTH = 240;

const MEDIA_BYTES = solidPng(MEDIA_WIDTH, 160, [0, 122, 255]);
const DOWNLOAD_PATH = /^\/v1\/attachments\/[^/]+\/download$/;

export interface RecordedCall {
    method: string;
    path: string;
    search: URLSearchParams;
    headers: Record<string, string>;
    body: unknown;
}

type Handler = (call: RecordedCall) => unknown;

const NO_RETENTION = { closed_ticket_days: null, audit_days: null };

const byId = (id: string) => {
    const found = [...OPEN_TICKETS, ...CLOSED_TICKETS].find((item) => item.id === id);

    return found && { client_id: `client-${id}`, ...found };
};

const atRisk = (item: Record<string, unknown>) =>
    typeof item.sla_warn_at === 'string' && Date.parse(item.sla_warn_at) <= SLA_NOW;

function ticketPage(search: URLSearchParams) {
    const counts = {
        open: OPEN_TICKETS.length,
        closed: CLOSED_TICKETS.length,
        at_risk: OPEN_TICKETS.filter(atRisk).length,
    };

    if (search.get('tab') === 'closed') {
        return { items: CLOSED_TICKETS, counts, next_cursor: null, cursor: '1' };
    }

    const query = search.get('q') ?? '';
    const riskOnly = search.get('sla') === 'at_risk';

    const matching = OPEN_TICKETS.filter(
        (item) => (item.number.includes(query) || item.description.includes(query)) && (!riskOnly || atRisk(item)),
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
    [/^\/v1\/notifications\/settings$/, () => ({ new_tickets: 'all', topics: [], max_alerts: false })],
    [/^\/v1\/tickets$/, (call) => ticketPage(call.search)],
    [/^\/v1\/tickets\/[^/]+\/messages$/, () => ({ items: MESSAGES, has_more: false, next_before: 0 })],
    [/^\/v1\/tickets\/t2\/sources\/m1$/, () => SOURCE_EXCERPT],
    [/^\/v1\/tickets\/[^/]+$/, (call) => byId(call.path.split('/')[3] ?? '')],
    [/^\/v1\/admin\/employees$/, () => ({ items: EMPLOYEES })],
    [/^\/v1\/admin\/templates$/, () => ({ items: TEMPLATES })],
    [/^\/v1\/admin\/settings$/, () => ({ ...SETTINGS, retention: NO_RETENTION })],
    [/^\/v1\/admin\/sla$/, () => SLA_CONFIG],
    [/^\/v1\/admin\/profile$/, () => PROFILE],
    [/^\/v1\/admin\/bot$/, () => BOT],
    [/^\/v1\/admin\/presets$/, () => PRESETS],
    [/^\/v1\/admin\/presets\/[^/]+\/preview$/, (call) => presetPreview(call.path.split('/')[4] ?? '')],
    [/^\/v1\/admin\/diagnostics$/, () => DIAGNOSTICS],
    [/^\/v1\/admin\/audit$/, () => ({ items: AUDIT })],
    [/^\/v1\/teams$/, () => ({ items: TEAMS })],
    [/^\/v1\/macros$/, () => ({ items: MACROS })],
    [/^\/v1\/admin\/routing-rules$/, () => RULES],
    [/^\/v1\/reports\/\w+$/, (call) => REPORTS[call.path.split('/')[3] ?? '']],
    [/^\/v1\/reports\/\w+\/export$/, () => 'Сотрудник;Взято'],
];

function mutationResult(call: RecordedCall, session: typeof SESSION): unknown {
    if (call.path === '/v1/auth/dev') {
        return session;
    }

    if (call.path === '/v1/notifications/settings') {
        return call.body;
    }

    if (call.path === '/v1/presence') {
        return { ...(call.body as object), presence_at: null, active: 0 };
    }

    if (call.path === '/v1/tickets/bulk') {
        const { ids } = call.body as { ids: string[] };

        return { results: ids.map((id, index) => ({ id, number: index + 1, ok: true })) };
    }

    if (call.path === '/v1/admin/profile') {
        return { ...PROFILE, ...(call.body as object), version: PROFILE.version + 1 };
    }

    const preset = /^\/v1\/admin\/presets\/([^/]+)\/apply$/.exec(call.path);

    if (preset) {
        return { profile: { ...PROFILE, preset: preset[1], version: PROFILE.version + 1 } };
    }

    if (/^\/v1\/admin\/clients\/[^/]+\/erase$/.test(call.path)) {
        return { client_id: call.path.split('/')[4], tickets: 2, already_erased: false };
    }

    const command = /^\/v1\/tickets\/([^/]+)\/(\w+)$/.exec(call.path);

    if (command) {
        return byId(command[1]);
    }

    return { ok: true };
}

export class MockApi {
    readonly calls: RecordedCall[] = [];
    private readonly overrides: { method: string; path: RegExp; status: number; body?: object }[] = [];
    private readonly replies = new Map<string, unknown>();
    private readonly readTickets = new Set<string>();

    private constructor(private readonly session: typeof SESSION) {}

    static async install(page: Page, session: typeof SESSION = SESSION): Promise<MockApi> {
        const mock = new MockApi(session);

        await page.route('https://st.max.ru/**', (route) =>
            route.fulfill({ contentType: 'text/javascript', body: '' }),
        );

        await page.route('**/health/live', (route) => route.fulfill({ json: { status: 'ok', version: 'v9.9.9' } }));
        await page.route('**/v1/**', (route, request) => mock.handle(route, request));

        return mock;
    }

    reply(path: string, body: unknown): void {
        this.replies.set(path, body);
    }

    failNext(method: string, path: RegExp, status: number, body?: object): void {
        this.overrides.push({ method, path, status, body });
    }

    callsTo(method: string, path: string | RegExp): RecordedCall[] {
        return this.calls.filter(
            (call) => call.method === method && (typeof path === 'string' ? call.path === path : path.test(call.path)),
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

        if (call.method === 'POST' && call.path === '/v1/notifications/read') {
            this.readTickets.add((call.body as { ticket_id: string }).ticket_id);
        }

        const index = this.overrides.findIndex((item) => item.method === call.method && item.path.test(call.path));

        if (index >= 0) {
            const [{ status, body }] = this.overrides.splice(index, 1);

            await route.fulfill({ status, json: body ?? { code: 'test_failure', message: `HTTP ${status}` } });

            return;
        }

        if (DOWNLOAD_PATH.test(call.path)) {
            await route.fulfill({ contentType: 'application/octet-stream', body: MEDIA_BYTES });

            return;
        }

        const body = call.method === 'GET' ? this.read(call) : mutationResult(call, this.session);

        await route.fulfill({ status: body === undefined ? 404 : 200, json: body ?? {} });
    }

    private markedRead<T extends { ticket_id: string; read_at: string | null }>(item: T): T {
        return this.readTickets.has(item.ticket_id)
            ? { ...item, read_at: item.read_at ?? new Date(SLA_NOW).toISOString() }
            : item;
    }

    private read(call: RecordedCall): unknown {
        if (this.replies.has(call.path)) {
            return this.replies.get(call.path);
        }

        if (call.path === '/v1/notifications') {
            return { items: NOTIFICATIONS.map((item) => this.markedRead(item)) };
        }

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
