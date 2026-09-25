type BackButton = {
  show: () => void;
  hide: () => void;
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
};

type Bridge = {
  initData?: string;
  platform?: string;
  BackButton?: BackButton;
  enableClosingConfirmation?: () => void;
  disableClosingConfirmation?: () => void;
  getViewportSize?: () => Promise<{ height: string; width: string }>;
  downloadFile?: (url: string, name: string) => Promise<unknown> | undefined;
};

declare global {
  interface Window {
    WebApp?: Bridge;
  }
}

const LAUNCH_POLL_ATTEMPTS = 30;
const LAUNCH_POLL_INTERVAL_MS = 100;
const VIEWPORT_TIMEOUT_MS = 1000;

export const bridge = () => window.WebApp;

export async function waitForLaunch(): Promise<string | null> {
  for (let i = 0; i < LAUNCH_POLL_ATTEMPTS; i++) {
    if (window.WebApp?.initData) {
      return window.WebApp.initData;
    }
    await new Promise((resolve) => setTimeout(resolve, LAUNCH_POLL_INTERVAL_MS));
  }
  return null;
}

function bestEffort(action: () => void): boolean {
  try {
    action();
    return true;
  } catch {
    return false;
  }
}

export function protectDraft(dirty: boolean): void {
  bestEffort(() => {
    if (dirty) {
      bridge()?.enableClosingConfirmation?.();
    } else {
      bridge()?.disableClosingConfirmation?.();
    }
  });
}

export function bindBack(callback: () => void): () => void {
  const back = bridge()?.BackButton;
  bestEffort(() => {
    back?.show();
    back?.onClick(callback);
  });
  return () => {
    bestEffort(() => {
      back?.offClick(callback);
      back?.hide();
    });
  };
}

export async function setViewport(): Promise<void> {
  await applyViewport().catch(() => undefined);
}

async function applyViewport(): Promise<void> {
  const result = await Promise.race([
    bridge()?.getViewportSize?.(),
    new Promise<undefined>((resolve) => setTimeout(resolve, VIEWPORT_TIMEOUT_MS)),
  ]);
  const height = Number.parseFloat(result?.height ?? '');
  if (Number.isFinite(height) && height >= 300 && height < 5000) {
    document.documentElement.style.setProperty('--host-height', `${height}px`);
  }
}
