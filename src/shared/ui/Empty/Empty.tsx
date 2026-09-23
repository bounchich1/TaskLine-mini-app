import type { ReactNode } from 'react';

import { Icon } from '../Icon/Icon';

import './Empty.scss';

/** The empty state of a list. */
export function Empty({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <Icon name="inbox" size={32} />
      </div>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__text">{children}</p>
    </div>
  );
}
