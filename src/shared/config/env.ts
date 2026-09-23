/** Origin of the API server; empty means the same origin. */
export const API_BASE = import.meta.env.VITE_API_BASE ?? '';

/** Local stand: the dev server signs in through /v1/auth/dev and shows a demo banner. */
export const IS_DEMO = import.meta.env.DEV && import.meta.env.VITE_DEV_AUTH === 'true';

export const DEV_USER_ID = import.meta.env.VITE_DEV_USER_ID ?? '1';
