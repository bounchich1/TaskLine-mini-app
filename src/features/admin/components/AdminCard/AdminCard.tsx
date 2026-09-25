import type { ReactNode } from 'react';

import './AdminCard.scss';

type AdminCardProps = {
    title: string;
    action?: ReactNode;
    children: ReactNode;
};

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
