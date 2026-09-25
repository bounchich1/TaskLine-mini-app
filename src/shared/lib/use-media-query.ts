import { useSyncExternalStore } from 'react';

export const MEDIA = {
    desktop: '(min-width: 1100px)',
    phone: '(max-width: 639px)',
} as const;

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
