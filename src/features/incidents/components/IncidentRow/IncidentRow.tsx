import { clsx } from 'clsx';

import { formatEta, incidentStatusLabel, ticketsCount } from '@/features/incidents/model/format';
import { formatDate } from '@/shared/lib/format-date';
import type { Incident } from '@/shared/types/incidents';
import { Icon } from '@/shared/ui';

import './IncidentRow.scss';

type IncidentRowProps = {
    incident: Incident;
    timezone: string;
    onOpen: (id: string) => void;
};

function meta(incident: Incident, timezone: string): string {
    if (incident.status === 'resolved') {
        return `Решён ${formatDate(incident.resolved_at, timezone)} · ${ticketsCount(incident.linked)}`;
    }

    const parts = [
        incident.tag_label,
        `открытых ${incident.linked_open} из ${incident.linked}`,
        `срок: ${formatEta(incident.eta, timezone)}`,
    ];

    return parts.join(' · ');
}

export function IncidentRow({ incident, timezone, onOpen }: IncidentRowProps) {
    return (
        <li>
            <button
                className="incident-row"
                onClick={() => {
                    onOpen(incident.id);
                }}
            >
                <span className={clsx('incident-row__status', `incident-row__status--${incident.status}`)}>
                    {incidentStatusLabel(incident.status)}
                </span>

                <span className="incident-row__main">
                    <span className="incident-row__title">{incident.title}</span>
                    <span className="incident-row__meta">{meta(incident, timezone)}</span>
                </span>

                <Icon name="arrow" size={16} className="incident-row__arrow" />
            </button>
        </li>
    );
}
