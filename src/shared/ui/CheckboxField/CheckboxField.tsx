import type { ReactNode } from 'react';

import './CheckboxField.scss';

type CheckboxFieldProps = {
    name: string;
    defaultChecked?: boolean;
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    children: ReactNode;
};

export function CheckboxField({ name, defaultChecked, checked, onChange, children }: CheckboxFieldProps) {
    return (
        <label className="checkbox-field">
            <input
                className="checkbox-field__input"
                type="checkbox"
                name={name}
                defaultChecked={defaultChecked}
                checked={checked}
                onChange={(event) => {
                    onChange?.(event.currentTarget.checked);
                }}
            />

            {children}
        </label>
    );
}
