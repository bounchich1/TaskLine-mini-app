import type { ReactNode } from 'react';

import './FormField.scss';

/** A labelled control of a dialog or settings form; the control is passed as children. */
export function FormField({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <label className="form-field">
      <span className="form-field__label">{label}</span>
      {children}
    </label>
  );
}
