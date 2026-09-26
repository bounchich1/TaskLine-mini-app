export type ColorScheme = 'light' | 'dark';

export type SchemePreference = ColorScheme | 'system';

export const SCHEME_STORAGE_KEY = 'color-scheme';

const isPreference = (value: unknown): value is SchemePreference =>
    value === 'light' || value === 'dark' || value === 'system';

export function readSchemePreference(): SchemePreference {
    try {
        const stored = localStorage.getItem(SCHEME_STORAGE_KEY);

        return isPreference(stored) ? stored : 'system';
    } catch {
        return 'system';
    }
}
