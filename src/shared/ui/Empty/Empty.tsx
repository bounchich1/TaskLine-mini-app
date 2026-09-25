import type { ReactNode } from 'react';

import './Empty.scss';

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
    return (
        <div className="empty-state">
            <p className="empty-state__title">{title}</p>
            {children ? <p className="empty-state__text">{children}</p> : null}
        </div>
    );
}
