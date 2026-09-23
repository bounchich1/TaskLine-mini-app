import type { Session } from './types';
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
export function setSession(value: Session | null) {
  session = value;
}
const base = import.meta.env.VITE_API_BASE ?? '';
export async function api<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    version?: number;
    key?: string;
    signal?: AbortSignal;
  } = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (session) {
    headers.Authorization = `Bearer ${session.token}`;
    headers['X-CSRF-Token'] = session.csrf;
  }
  const method = options.method ?? 'GET';
  if (method !== 'GET') {
    headers['Idempotency-Key'] = options.key ?? crypto.randomUUID();
  }
  if (options.version !== undefined) {
    headers['If-Match'] = String(options.version);
  }
  const multipart = options.body instanceof FormData;
  if (options.body !== undefined && !multipart) {
    headers['Content-Type'] = 'application/json';
  }
  let response: Response;
  try {
    response = await fetch(`${base}${path}`, {
      method,
      headers,
      body: multipart
        ? (options.body as FormData)
        : options.body === undefined
          ? undefined
          : JSON.stringify(options.body),
      credentials: 'include',
      signal: options.signal,
    });
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw error;
    }
    throw new ApiError('network', 'Нет связи с сервером. Повторите действие.', 0);
  }
  const data = await response
    .json()
    .catch(() => ({ code: 'invalid_response', message: 'Сервер вернул некорректный ответ.' }));
  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new Event('session-expired'));
    }
    throw new ApiError(
      data.code ?? 'error',
      data.message ?? 'Не удалось выполнить действие.',
      response.status,
    );
  }
  return data as T;
}
export async function events(
  cursor: string,
  onChange: () => void,
  onState: (state: 'live' | 'reconnecting') => void,
  signal: AbortSignal,
) {
  let delay = 1000;
  while (!signal.aborted && session) {
    try {
      const response = await fetch(`${base}/v1/events?cursor=${encodeURIComponent(cursor)}`, {
        headers: { Authorization: `Bearer ${session.token}` },
        credentials: 'include',
        signal,
      });
      if (response.status === 401) {
        window.dispatchEvent(new Event('session-expired'));
        return;
      }
      if (!response.ok || !response.body) {
        throw new Error('stream');
      }
      onState('live');
      onChange();
      delay = 1000;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let pending = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        pending += decoder.decode(value, { stream: true });
        if (pending.length > 1024 * 1024) {
          throw new Error('stream_limit');
        }
        let index;
        while ((index = pending.indexOf('\n\n')) >= 0) {
          const packet = pending.slice(0, index);
          pending = pending.slice(index + 2);
          const id = /^id: (\d+)$/m.exec(packet);
          if (id) {
            cursor = id[1];
          }
          if (packet.includes('event: session_expired')) {
            window.dispatchEvent(new Event('session-expired'));
            return;
          }
          if (/event: (change|resync)/.test(packet)) {
            onChange();
          }
        }
      }
    } catch {
      if (signal.aborted) {
        return;
      }
    }
    onState('reconnecting');
    await new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, delay);
      signal.addEventListener(
        'abort',
        () => {
          clearTimeout(timer);
          resolve();
        },
        { once: true },
      );
    });
    delay = Math.min(30000, delay * 2);
  }
}
export async function downloadBrowser(id: string, filename: string) {
  const response = await fetch(`${base}/v1/attachments/${id}/download`, {
    headers: { Authorization: `Bearer ${session?.token ?? ''}` },
    credentials: 'include',
  });
  if (!response.ok) {
    throw new ApiError('download_failed', 'Не удалось скачать файл.', response.status);
  }
  const url = URL.createObjectURL(await response.blob());
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
