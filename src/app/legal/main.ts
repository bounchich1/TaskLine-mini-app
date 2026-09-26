import { readSchemePreference } from '@/shared/lib/scheme-preference';

import './legal.scss';

const preference = readSchemePreference();

if (preference !== 'system') {
    document.documentElement.dataset.scheme = preference;
}
