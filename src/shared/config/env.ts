export const API_BASE = import.meta.env.VITE_API_BASE ?? '';

export const IS_DEMO = import.meta.env.DEV && import.meta.env.VITE_DEV_AUTH === 'true';

export const DEV_USER_ID = import.meta.env.VITE_DEV_USER_ID ?? '1';
