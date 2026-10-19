import type { Incident, IncidentDetail } from '@/shared/types/incidents';
import { Empty } from '@/shared/ui';

import { IncidentRow } from '../IncidentRow/IncidentRow';
import { SuggestionCard } from '../SuggestionCard/SuggestionCard';

import './IncidentsTab.scss';

export type IncidentsTabName = 'suggested' | 'open' | 'resolved';

const EMPTY: Record<IncidentsTabName, { title: string; text: string }> = {
    suggested: {
        title: 'Подсказок нет',
        text:
            'Раз в минуту детектор сравнивает поток обращений по каждой теме с обычным ' +
            'и предложит инцидент при всплеске.',
    },
    open: { title: 'Инцидентов нет', text: 'Создайте инцидент вручную или из подсказки детектора.' },
    resolved: { title: 'Решённых за 30 дней нет', text: 'Здесь будут завершённые инциденты.' },
};

type IncidentsTabProps = {
    tab: IncidentsTabName;
    label: string;
    items: Incident[] | undefined;
    timezone: string;
    now: number;
    onOpen: (id: string) => void;
    onCreate: (suggestion: IncidentDetail) => void;
};

export function IncidentsTab({ tab, label, items, timezone, now, onOpen, onCreate }: IncidentsTabProps) {
    if (!items) {
        return null;
    }

    if (!items.length) {
        return <Empty title={EMPTY[tab].title}>{EMPTY[tab].text}</Empty>;
    }

    if (tab === 'suggested') {
        return (
            <div className="incidents-tab__cards">
                {items.map((incident) => (
                    <SuggestionCard
                        key={incident.id}
                        incident={incident}
                        timezone={timezone}
                        now={now}
                        onCreate={onCreate}
                    />
                ))}
            </div>
        );
    }

    return (
        <ul className="incidents-tab__list" aria-label={label}>
            {items.map((incident) => (
                <IncidentRow key={incident.id} incident={incident} timezone={timezone} onOpen={onOpen} />
            ))}
        </ul>
    );
}
