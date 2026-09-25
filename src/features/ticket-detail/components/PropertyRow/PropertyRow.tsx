import type { ReactNode } from 'react';

import './PropertyRow.scss';

/** A label–value row of the ticket's property list (a `<dl>`). */
export function PropertyRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="property-row">
      <dt className="property-row__label">{label}</dt>
      <dd className="property-row__value">{children}</dd>
    </div>
  );
}
