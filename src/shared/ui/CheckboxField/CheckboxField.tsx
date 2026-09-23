import type { ReactNode } from 'react';

import './CheckboxField.scss';

type CheckboxFieldProps = {
  name: string;
  defaultChecked: boolean | undefined;
  children: ReactNode;
};

/** An uncontrolled checkbox with its label, for forms read through FormData. */
export function CheckboxField({ name, defaultChecked, children }: CheckboxFieldProps) {
  return (
    <label className="checkbox-field">
      <input
        className="checkbox-field__input"
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
      />
      {children}
    </label>
  );
}
