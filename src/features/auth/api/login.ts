import { api } from '@/shared/api/http';
import { DEV_USER_ID, IS_DEMO } from '@/shared/config/env';
import { waitForLaunch } from '@/shared/platform/max-bridge';
import type { Session } from '@/shared/types/api';

let pendingLogin: Promise<Session> | null = null;

async function requestSession(): Promise<Session> {
  if (IS_DEMO) {
    return api<Session>('/v1/auth/dev', { method: 'POST', body: { user_id: DEV_USER_ID } });
  }
  const raw = await waitForLaunch();
  if (!raw) {
    throw new Error(
      'Откройте мини-приложение через бота в MAX. Доступ предоставляется сотрудникам поддержки.',
    );
  }
  return api<Session>('/v1/auth/max', { method: 'POST', body: { init_data: raw } });
}

export async function login(): Promise<Session> {
  pendingLogin ??= requestSession();
  try {
    return await pendingLogin;
  } catch (error) {
    pendingLogin = null;
    throw error;
  }
}

export function forgetLogin(): void {
  pendingLogin = null;
}
