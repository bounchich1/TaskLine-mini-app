import type { ReactNode } from 'react';

import './PageHeader.scss';

type PageHeaderProps = {
  title: string;
  /** Shown after the title, e.g. tabs or a count. */
  children?: ReactNode;
  /** Shown at the end of the row, e.g. a refresh button. */
  actions?: ReactNode;
};

/** The title row of a workspace section. */
export function PageHeader({ title, children, actions }: PageHeaderProps) {
  return (
    <div className="page-header">
      <h1 className="page-header__title">{title}</h1>
      {children}
      {actions ? <div className="page-header__actions">{actions}</div> : null}
    </div>
  );
}
