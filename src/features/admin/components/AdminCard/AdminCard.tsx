import { useId, type ReactNode } from 'react';

import './AdminCard.scss';

type AdminCardProps = {
    title: string;
    action?: ReactNode;
    children: ReactNode;
};

export function AdminCard({ title, action, children }: AdminCardProps) {
    const titleId = useId();

    return (
        <section className="admin-card" aria-labelledby={titleId}>
            <div className="admin-card__header">
                <h2 className="admin-card__title" id={titleId}>
                    {title}
                </h2>

                {action}
            </div>

            {children}
        </section>
    );
}
