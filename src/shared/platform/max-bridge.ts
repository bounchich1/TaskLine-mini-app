type BackButton = {
  show: () => void;
  hide: () => void;
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
};

/** The subset of the MAX WebApp bridge (max-web-app.js) the app uses. */
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

/** Waits up to 3 s for the host to inject launch data; `null` outside MAX. */
export async function waitForLaunch(): Promise<string | null> {
  for (let i = 0; i < LAUNCH_POLL_ATTEMPTS; i++) {
    if (window.WebApp?.initData) {
      return window.WebApp.initData;
    }
    await new Promise((resolve) => setTimeout(resolve, LAUNCH_POLL_INTERVAL_MS));
  }
  return null;
}

/** Asks the host to confirm closing while a draft is unsent. */
export function protectDraft(dirty: boolean): void {
  try {
    if (dirty) {
      bridge()?.enableClosingConfirmation?.();
    } else {
      bridge()?.disableClosingConfirmation?.();
    }
  } catch {
    /* Host capability is best effort. */
  }
}

/** Shows the host back button while mounted; returns the cleanup. */
export function bindBack(callback: () => void): () => void {
  const back = bridge()?.BackButton;
  try {
    back?.show();
    back?.onClick(callback);
  } catch {
    /* Host capability is best effort. */
  }
  return () => {
    try {
      back?.offClick(callback);
      back?.hide();
    } catch {
      /* Host capability is best effort. */
    }
  };
}

/** Publishes the host viewport height as `--host-height`. */
export async function setViewport(): Promise<void> {
  try {
    const result = await Promise.race([
      bridge()?.getViewportSize?.(),
      new Promise<undefined>((resolve) => setTimeout(resolve, VIEWPORT_TIMEOUT_MS)),
    ]);
    const height = Number.parseFloat(result?.height ?? '');
    if (Number.isFinite(height) && height >= 300 && height < 5000) {
      document.documentElement.style.setProperty('--host-height', `${height}px`);
    }
  } catch {
    /* Host capability is best effort. */
  }
}
