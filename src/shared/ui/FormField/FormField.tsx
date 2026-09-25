import type { ReactNode } from 'react';

import './FormField.scss';

export function FormField({ label, children }: { label: ReactNode; children: ReactNode }) {
    return (
        <label className="form-field">
            <span className="form-field__label">{label}</span>
            {children}
        </label>
    );
}
