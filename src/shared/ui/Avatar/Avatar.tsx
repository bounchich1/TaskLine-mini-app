import type { ReactNode } from 'react';

import './Avatar.scss';

/** A round badge with an initial or an icon. */
export function Avatar({
  size = 'medium',
  children,
}: {
  size?: 'small' | 'medium';
  children: ReactNode;
}) {
  return <span className={`avatar avatar--${size}`}>{children}</span>;
}
