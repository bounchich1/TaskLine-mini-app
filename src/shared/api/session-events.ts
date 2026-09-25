const SESSION_EXPIRED = 'session-expired';

export function notifySessionExpired(): void {
    window.dispatchEvent(new Event(SESSION_EXPIRED));
}

export function onSessionExpired(listener: () => void): () => void {
    window.addEventListener(SESSION_EXPIRED, listener);

    return () => {
        window.removeEventListener(SESSION_EXPIRED, listener);
    };
}
