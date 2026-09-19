type Bridge = {
  initData?: string;
  platform?: string;
  BackButton?: {
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  enableClosingConfirmation?: () => void;
  disableClosingConfirmation?: () => void;
  getViewportSize?: () => Promise<{ height: string; width: string }>;
  downloadFile?: (url: string, name: string) => Promise<unknown> | void;
};
declare global {
  interface Window {
    WebApp?: Bridge;
  }
}
export const bridge = () => window.WebApp;
export async function waitForLaunch(): Promise<string | null> {
  for (let i = 0; i < 30; i++) {
    if (window.WebApp?.initData) return window.WebApp.initData;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return null;
}
export function protectDraft(dirty: boolean) {
  try {
    if (dirty) bridge()?.enableClosingConfirmation?.();
    else bridge()?.disableClosingConfirmation?.();
  } catch {
    /* Host capability is best effort. */
  }
}
export function bindBack(callback: () => void) {
  const back = bridge()?.BackButton;
  try {
    back?.show();
    back?.onClick(callback);
  } catch {}
  return () => {
    try {
      back?.offClick(callback);
      back?.hide();
    } catch {}
  };
}
export async function setViewport() {
  try {
    const result = await Promise.race([
      bridge()?.getViewportSize?.(),
      new Promise<undefined>((resolve) => setTimeout(resolve, 1000)),
    ]);
    const height = Number.parseFloat(result?.height ?? '');
    if (Number.isFinite(height) && height >= 300 && height < 5000)
      document.documentElement.style.setProperty('--host-height', `${height}px`);
  } catch {}
}
