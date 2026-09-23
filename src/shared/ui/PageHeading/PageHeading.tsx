import type { ReactNode } from 'react';

import './PageHeading.scss';

type PageHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  /** Shown at the end of the heading row, e.g. a refresh button. */
  action?: ReactNode;
};

/** The heading of a workspace section. */
export function PageHeading({ eyebrow, title, description, action }: PageHeadingProps) {
  return (
    <div className="page-heading">
      <div>
        <span className="page-heading__eyebrow">{eyebrow}</span>
        <h1 className="page-heading__title">
          {title}
          <span className="page-heading__dot">.</span>
        </h1>
        {description ? <p className="page-heading__description">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
