import { useSyncExternalStore } from 'react';

/** Viewport widths from shared/styles/abstracts/_breakpoints.scss. */
export const MEDIA = {
  /** The queue and the open ticket fit side by side. */
  desktop: '(min-width: 1100px)',
  phone: '(max-width: 639px)',
} as const;

/** Whether the media query matches, following changes (resize, rotation). */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => {
        list.removeEventListener('change', onChange);
      };
    },
    () => window.matchMedia(query).matches,
  );
}
