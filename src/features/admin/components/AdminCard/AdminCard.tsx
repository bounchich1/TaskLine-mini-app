import type { ReactNode } from 'react';

import './AdminCard.scss';

type AdminCardProps = {
  title: string;
  /** Shown next to the title, e.g. an "add" button. */
  action?: ReactNode;
  children: ReactNode;
};

/** A section of the admin page: a title row, then its content. */
export function AdminCard({ title, action, children }: AdminCardProps) {
  return (
    <section className="admin-card">
      <div className="admin-card__header">
        <h2 className="admin-card__title">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
