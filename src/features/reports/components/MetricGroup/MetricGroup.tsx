import { useId, type ReactNode } from 'react';

import './MetricGroup.scss';

type MetricGroupProps = { title: string; note?: ReactNode; children: ReactNode };

export function MetricGroup({ title, note, children }: MetricGroupProps) {
    const titleId = useId();

    return (
        <section className="metric-group" aria-labelledby={titleId}>
            <div className="metric-group__header">
                <h2 className="metric-group__title" id={titleId}>
                    {title}
                </h2>

                {note ? <span className="metric-group__note">{note}</span> : null}
            </div>

            <ul className="metric-group__rows">{children}</ul>
        </section>
    );
}
