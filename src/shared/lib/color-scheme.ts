import { useSystemColorScheme } from '@maxhub/max-ui';
import { useSyncExternalStore } from 'react';

export type ColorScheme = 'light' | 'dark';

export type SchemePreference = ColorScheme | 'system';

const STORAGE_KEY = 'color-scheme';

const listeners = new Set<() => void>();

const isPreference = (value: unknown): value is SchemePreference =>
    value === 'light' || value === 'dark' || value === 'system';

function readPreference(): SchemePreference {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);

        return isPreference(stored) ? stored : 'system';
    } catch {
        return 'system';
    }
}

let current = readPreference();

function subscribe(onChange: () => void) {
    const onStorage = (event: StorageEvent) => {
        if (event.key === STORAGE_KEY) {
            current = readPreference();
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
            localStorage.removeItem(STORAGE_KEY);
        } else {
            localStorage.setItem(STORAGE_KEY, preference);
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
