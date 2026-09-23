import type { ReactNode } from 'react';

/** A round badge with an initial or an icon. */
export function Avatar({
  size = 'medium',
  children,
}: {
  size?: 'small' | 'medium';
  children: ReactNode;
}) {
  return <span className={size === 'small' ? 'avatar-small' : 'avatar'}>{children}</span>;
}
