import type { ReactNode } from 'react';

import './FormField.scss';

type FormFieldProps = {
    label: ReactNode;
    hint?: ReactNode;
    children: ReactNode;
};

export function FormField({ label, hint, children }: FormFieldProps) {
    return (
        <label className="form-field">
            <span className="form-field__label">{label}</span>
            {children}
            {hint ? <small className="form-field__hint">{hint}</small> : null}
        </label>
    );
}
