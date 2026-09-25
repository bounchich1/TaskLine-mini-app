import { clsx } from 'clsx';
import type { ReactNode } from 'react';

import './AdminRow.scss';

type AdminRowProps = {
  wrap?: boolean;
  children: ReactNode;
};

export function AdminRow({ wrap = false, children }: AdminRowProps) {
  return <div className={clsx('admin-row', wrap && 'admin-row--wrap')}>{children}</div>;
}
