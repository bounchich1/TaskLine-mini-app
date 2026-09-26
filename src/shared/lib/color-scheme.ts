import { useSystemColorScheme } from '@maxhub/max-ui';
import { useSyncExternalStore } from 'react';

import { readSchemePreference, SCHEME_STORAGE_KEY, type ColorScheme, type SchemePreference } from './scheme-preference';

export type { ColorScheme, SchemePreference } from './scheme-preference';

const listeners = new Set<() => void>();

let current = readSchemePreference();

function subscribe(onChange: () => void) {
    const onStorage = (event: StorageEvent) => {
        if (event.key === SCHEME_STORAGE_KEY) {
            current = readSchemePreference();
            onChange();
        }
    };

    listeners.add(onChange);
    window.addEventListener('storage', onStorage);

    return () => {
        listeners.delete(onChange);
        window.removeEventListener('storage', onStorage);
    };
}

function persist(preference: SchemePreference): void {
    try {
        if (preference === 'system') {
            localStorage.removeItem(SCHEME_STORAGE_KEY);
        } else {
            localStorage.setItem(SCHEME_STORAGE_KEY, preference);
        }
    } catch {
        return;
    }
}

export function setSchemePreference(preference: SchemePreference): void {
    current = preference;
    persist(preference);

    listeners.forEach((listener) => {
        listener();
    });
}

export function useSchemePreference(): SchemePreference {
    return useSyncExternalStore(subscribe, () => current);
}

export function useColorScheme(): ColorScheme {
    const system = useSystemColorScheme({ listenChanges: true });
    const preference = useSchemePreference();

    return preference === 'system' ? system : preference;
}
