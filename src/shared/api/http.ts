import { API_BASE } from '@/shared/config/env';
import type { Session } from '@/shared/types/api';

import { notifySessionExpired } from './session-events';

let session: Session | null = null;

export class ApiError extends Error {
    constructor(
        public code: string,
        message: string,
        public status: number,
    ) {
        super(message);
    }
}

export function setSession(value: Session | null): void {
    session = value;
}

export function hasSession(): boolean {
    return session !== null;
}

export function authHeaders(): Record<string, string> {
    return { Authorization: `Bearer ${session?.token ?? ''}` };
}

export type ApiOptions = {
    method?: string;
    body?: unknown;
    version?: number;
    key?: string;
    signal?: AbortSignal;
};

type ErrorBody = { code?: string; message?: string };

function requestHeaders(method: string, options: ApiOptions): Record<string, string> {
    const headers: Record<string, string> = {};

    if (session) {
        headers.Authorization = `Bearer ${session.token}`;
        headers['X-CSRF-Token'] = session.csrf;
    }

    if (method !== 'GET') {
        headers['Idempotency-Key'] = options.key ?? crypto.randomUUID();
    }

    if (options.version !== undefined) {
        headers['If-Match'] = String(options.version);
    }

    if (options.body !== undefined && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    return headers;
}

function requestBody(body: unknown): BodyInit | undefined {
    if (body instanceof FormData) {
        return body;
    }

    return body === undefined ? undefined : JSON.stringify(body);
}

async function send(path: string, init: RequestInit): Promise<Response> {
    try {
        return await fetch(`${API_BASE}${path}`, init);
    } catch (error) {
        if ((error as Error).name === 'AbortError') {
            throw error;
        }

        throw new ApiError('network', 'Нет связи с сервером. Повторите действие.', 0);
    }
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
    const method = options.method ?? 'GET';

    const response = await send(path, {
        method,
        headers: requestHeaders(method, options),
        body: requestBody(options.body),
        credentials: 'include',
        signal: options.signal,
    });

    const data: unknown = await response
        .json()
        .catch(() => ({ code: 'invalid_response', message: 'Сервер вернул некорректный ответ.' }));

    if (!response.ok) {
        if (response.status === 401) {
            notifySessionExpired();
        }

        const error = data as ErrorBody;

        throw new ApiError(error.code ?? 'error', error.message ?? 'Не удалось выполнить действие.', response.status);
    }

    return data as T;
}
