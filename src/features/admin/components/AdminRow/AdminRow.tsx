import { clsx } from 'clsx';
import type { ReactNode } from 'react';

import './AdminRow.scss';

type AdminRowProps = {
  /** Wraps the actions under the text on tablets. */
  wrap?: boolean;
  children: ReactNode;
};

/**
 * A list row of the admin section. Children use the `admin-row__main` / `__title` / `__meta` /
 * `__status` / `__badge` / `__link` elements.
 */
export function AdminRow({ wrap = false, children }: AdminRowProps) {
  return <div className={clsx('admin-row', wrap && 'admin-row--wrap')}>{children}</div>;
}
