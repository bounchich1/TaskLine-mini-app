const SESSION_EXPIRED = 'session-expired';

/** Tells the app that the server rejected the session (HTTP 401 or an SSE `session_expired`). */
export function notifySessionExpired(): void {
  window.dispatchEvent(new Event(SESSION_EXPIRED));
}

export function onSessionExpired(listener: () => void): () => void {
  window.addEventListener(SESSION_EXPIRED, listener);
  return () => {
    window.removeEventListener(SESSION_EXPIRED, listener);
  };
}
