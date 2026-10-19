import { updateLabel } from '@/features/incidents/model/format';
import { formatDate } from '@/shared/lib/format-date';
import { plural } from '@/shared/lib/plural';
import type { IncidentUpdate } from '@/shared/types/incidents';

import './IncidentTimeline.scss';

type IncidentTimelineProps = {
    updates: IncidentUpdate[];
    timezone: string;
};

function delivery(update: IncidentUpdate): string | null {
    if (!update.broadcast) {
        return null;
    }

    if (!update.finished_at) {
        return 'рассылается…';
    }

    return `отправлено ${update.recipients} ${plural(update.recipients, ['клиенту', 'клиентам', 'клиентам'])}`;
}

export function IncidentTimeline({ updates, timezone }: IncidentTimelineProps) {
    if (!updates.length) {
        return null;
    }

    return (
        <section className="incident-timeline" aria-label="Хронология">
            <h2 className="incident-timeline__title">Хронология</h2>

            <ol className="incident-timeline__list">
                {updates.map((update) => {
                    const sent = delivery(update);

                    return (
                        <li key={update.id} className="incident-timeline__item">
                            <span className="incident-timeline__head">
                                <span className="incident-timeline__kind">{updateLabel(update.kind)}</span>

                                <time className="incident-timeline__time" dateTime={update.created_at}>
                                    {formatDate(update.created_at, timezone)}
                                </time>

                                {update.author_name ? (
                                    <span className="incident-timeline__author">{update.author_name}</span>
                                ) : null}
                            </span>

                            {update.text ? <p className="incident-timeline__text">{update.text}</p> : null}
                            {sent ? <span className="incident-timeline__sent">{sent}</span> : null}
                        </li>
                    );
                })}
            </ol>
        </section>
    );
}
