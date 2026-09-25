import type { ReactNode } from 'react';

import './PageHeader.scss';

type PageHeaderProps = {
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({ title, children, actions }: PageHeaderProps) {
  return (
    <div className="page-header">
      <h1 className="page-header__title">{title}</h1>
      {children}
      {actions ? <div className="page-header__actions">{actions}</div> : null}
    </div>
  );
}
