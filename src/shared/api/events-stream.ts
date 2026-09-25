import { API_BASE } from '@/shared/config/env';

import { authHeaders, hasSession } from './http';
import { notifySessionExpired } from './session-events';

export type ConnectionState = 'live' | 'reconnecting';

/** One server-side change, as the stream's `change` event reports it. */
export type LiveEvent = { type: string; ticket_id: string | null };

export type StreamListeners = {
  /** New changes, in order: one call per chunk read, however many events it held. */
  onEvents: (events: LiveEvent[]) => void;
  /** Anything may have changed: on every (re)connect and when the server asks to resync. */
  onResync: () => void;
  onState: (state: ConnectionState) => void;
};

/**
 * Survives reconnects: the last event id seen and the current backoff delay. Without a cursor
 * the server starts from its newest event.
 */
type StreamState = { cursor: string | null; delay: number };

type StreamOutcome = 'closed' | 'expired';

type ChunkResult = { events: LiveEvent[]; resync: boolean; expired: boolean };

const INITIAL_DELAY_MS = 1000;
const MAX_DELAY_MS = 30000;
const MAX_BUFFERED_CHARS = 1024 * 1024;

function parseEvent(packet: string): LiveEvent | null {
  const data = /^data: (.*)$/m.exec(packet);
  try {
    return data ? (JSON.parse(data[1]) as LiveEvent) : null;
  } catch {
    return null;
  }
}

function handlePacket(packet: string, stream: StreamState, result: ChunkResult): void {
  const id = /^id: (\d+)$/m.exec(packet);
  if (id) {
    stream.cursor = id[1];
  }
  if (packet.includes('event: session_expired')) {
    result.expired = true;
  } else if (packet.includes('event: resync')) {
    result.resync = true;
  } else if (packet.includes('event: change')) {
    // An unreadable payload still means something changed.
    result.events.push(parseEvent(packet) ?? { type: 'unknown', ticket_id: null });
  }
}

async function readPackets(
  body: ReadableStream<Uint8Array>,
  stream: StreamState,
  listeners: StreamListeners,
): Promise<StreamOutcome> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffered = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      return 'closed';
    }
    buffered += decoder.decode(value, { stream: true });
    if (buffered.length > MAX_BUFFERED_CHARS) {
      throw new Error('stream_limit');
    }
    const packets = buffered.split('\n\n');
    buffered = packets.pop() ?? '';
    const result: ChunkResult = { events: [], resync: false, expired: false };
    for (const packet of packets) {
      handlePacket(packet, stream, result);
    }
    if (result.expired) {
      return 'expired';
    }
    if (result.resync) {
      listeners.onResync();
    } else if (result.events.length > 0) {
      listeners.onEvents(result.events);
    }
  }
}

/** One connection, from the request until the server closes the stream. */
async function listen(
  stream: StreamState,
  listeners: StreamListeners,
  signal: AbortSignal,
): Promise<StreamOutcome> {
  const query = stream.cursor === null ? '' : `?cursor=${encodeURIComponent(stream.cursor)}`;
  const response = await fetch(`${API_BASE}/v1/events${query}`, {
    headers: authHeaders(),
    credentials: 'include',
    signal,
  });
  if (response.status === 401) {
    return 'expired';
  }
  if (!response.ok || !response.body) {
    throw new Error('stream');
  }
  listeners.onState('live');
  listeners.onResync();
  stream.delay = INITIAL_DELAY_MS;
  return readPackets(response.body, stream, listeners);
}

function pause(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        resolve();
      },
      { once: true },
    );
  });
}

/**
 * Follows the server's UI event stream, starting from now, until `signal` aborts or the session
 * ends. Reconnects with a backoff that doubles from 1 s up to 30 s, resuming after the last
 * event seen.
 */
export async function events(listeners: StreamListeners, signal: AbortSignal): Promise<void> {
  const stream: StreamState = { cursor: null, delay: INITIAL_DELAY_MS };
  // A function, so TypeScript does not narrow `signal.aborted` to false across the awaits below.
  const running = () => !signal.aborted && hasSession();
  while (running()) {
    try {
      if ((await listen(stream, listeners, signal)) === 'expired') {
        notifySessionExpired();
        return;
      }
    } catch {
      if (signal.aborted) {
        return;
      }
    }
    listeners.onState('reconnecting');
    await pause(stream.delay, signal);
    stream.delay = Math.min(MAX_DELAY_MS, stream.delay * 2);
  }
}
