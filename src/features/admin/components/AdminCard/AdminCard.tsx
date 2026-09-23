import type { ReactNode } from 'react';

import './AdminCard.scss';

type AdminCardProps = {
  title: string;
  /** Shown next to the title, e.g. an "add" button. */
  action?: ReactNode;
  /** Lays the title out as a header row (always, when there is an action). */
  withHeader?: boolean;
  children: ReactNode;
};

/** A panel of the admin section. */
export function AdminCard({
  title,
  action,
  withHeader = action !== undefined,
  children,
}: AdminCardProps) {
  return (
    <section className="admin-card">
      {withHeader ? (
        <div className="admin-card__header">
          <h2 className="admin-card__heading">{title}</h2>
          {action}
        </div>
      ) : (
        <h2 className="admin-card__title">{title}</h2>
      )}
      {children}
    </section>
  );
}
