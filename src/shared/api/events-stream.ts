import { API_BASE } from '@/shared/config/env';

import { authHeaders, hasSession } from './http';
import { notifySessionExpired } from './session-events';

export type ConnectionState = 'live' | 'reconnecting';

type Listeners = {
  onChange: () => void;
  onState: (state: ConnectionState) => void;
};

/** Survives reconnects: the last event id seen and the current backoff delay. */
type StreamState = { cursor: string; delay: number };

type StreamOutcome = 'closed' | 'expired';

const INITIAL_DELAY_MS = 1000;
const MAX_DELAY_MS = 30000;
const MAX_BUFFERED_CHARS = 1024 * 1024;

function handlePacket(packet: string, stream: StreamState, onChange: () => void): boolean {
  const id = /^id: (\d+)$/m.exec(packet);
  if (id) {
    stream.cursor = id[1];
  }
  if (packet.includes('event: session_expired')) {
    return false;
  }
  if (/event: (change|resync)/.test(packet)) {
    onChange();
  }
  return true;
}

async function readPackets(
  body: ReadableStream<Uint8Array>,
  stream: StreamState,
  onChange: () => void,
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
    if (!packets.every((packet) => handlePacket(packet, stream, onChange))) {
      return 'expired';
    }
  }
}

/** One connection, from the request until the server closes the stream. */
async function listen(
  stream: StreamState,
  listeners: Listeners,
  signal: AbortSignal,
): Promise<StreamOutcome> {
  const response = await fetch(
    `${API_BASE}/v1/events?cursor=${encodeURIComponent(stream.cursor)}`,
    { headers: authHeaders(), credentials: 'include', signal },
  );
  if (response.status === 401) {
    return 'expired';
  }
  if (!response.ok || !response.body) {
    throw new Error('stream');
  }
  listeners.onState('live');
  listeners.onChange();
  stream.delay = INITIAL_DELAY_MS;
  return readPackets(response.body, stream, listeners.onChange);
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
 * Follows the server's UI event stream until `signal` aborts or the session ends. Calls
 * `onChange` on connect and on every change/resync event; reconnects with a backoff that
 * doubles from 1 s up to 30 s.
 */
export async function events(
  cursor: string,
  onChange: () => void,
  onState: (state: ConnectionState) => void,
  signal: AbortSignal,
): Promise<void> {
  const stream: StreamState = { cursor, delay: INITIAL_DELAY_MS };
  // A function, so TypeScript does not narrow `signal.aborted` to false across the awaits below.
  const running = () => !signal.aborted && hasSession();
  while (running()) {
    try {
      if ((await listen(stream, { onChange, onState }, signal)) === 'expired') {
        notifySessionExpired();
        return;
      }
    } catch {
      if (signal.aborted) {
        return;
      }
    }
    onState('reconnecting');
    await pause(stream.delay, signal);
    stream.delay = Math.min(MAX_DELAY_MS, stream.delay * 2);
  }
}
