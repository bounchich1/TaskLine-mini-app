import type { ReactNode } from 'react';

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
        <span className="eyebrow">{eyebrow}</span>
        <h1>
          {title}
          <span className="title-dot">.</span>
        </h1>
        {description ? <p>{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
