import type { ReactNode } from 'react';

import { Icon } from '../Icon/Icon';

/** The empty state of a list. */
export function Empty({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Icon name="inbox" size={32} />
      </div>
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
