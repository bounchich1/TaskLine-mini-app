import { Button } from '@maxhub/max-ui';

import { useIncident, useIncidentAction } from '@/features/incidents/hooks/use-incidents';
import { detectionSummary } from '@/features/incidents/model/format';
import { formatTimeAgo } from '@/shared/lib/format-date';
import type { Incident, IncidentDetail } from '@/shared/types/incidents';
import { ErrorNotice, Icon } from '@/shared/ui';

import './SuggestionCard.scss';

const SAMPLES = 3;

type SuggestionCardProps = {
    incident: Incident;
    timezone: string;
    now: number;
    onCreate: (detail: IncidentDetail) => void;
};

export function SuggestionCard({ incident, timezone, now, onCreate }: SuggestionCardProps) {
    const detail = useIncident(incident.id);
    const dismiss = useIncidentAction();
    const samples = detail.data?.candidates.slice(0, SAMPLES) ?? [];
    const terms = incident.detection?.terms ?? [];

    return (
        <article className="suggestion-card" aria-label={`Подсказка: ${incident.title}`}>
            <div className="suggestion-card__head">
                <Icon name="zap" size={18} className="suggestion-card__icon" />

                <div className="suggestion-card__titles">
                    <h3 className="suggestion-card__title">Возможная авария: {incident.title}</h3>
                    <p className="suggestion-card__summary">{detectionSummary(incident)}</p>
                </div>

                <time className="suggestion-card__time" dateTime={incident.updated_at}>
                    {formatTimeAgo(incident.updated_at, timezone, now)}
                </time>
            </div>

            {terms.length ? (
                <ul className="suggestion-card__terms" aria-label="Общие слова">
                    {terms.map((term) => (
                        <li key={term} className="suggestion-card__term">
                            {term}
                        </li>
                    ))}
                </ul>
            ) : null}

            {samples.length ? (
                <ul className="suggestion-card__samples" aria-label="Примеры обращений">
                    {samples.map((sample) => (
                        <li key={sample.id} className="suggestion-card__sample">
                            <span className="suggestion-card__number">№{sample.number}</span>
                            {sample.description}
                        </li>
                    ))}
                </ul>
            ) : null}

            <ErrorNotice error={dismiss.error} />

            <div className="suggestion-card__actions">
                <Button
                    size="small"
                    disabled={!detail.data}
                    onClick={() => {
                        if (detail.data) {
                            onCreate(detail.data);
                        }
                    }}
                >
                    Создать инцидент
                </Button>

                <Button
                    size="small"
                    variant="secondary"
                    loading={dismiss.isPending}
                    onClick={() => {
                        dismiss.mutate({ path: `/v1/incidents/${incident.id}/dismiss`, version: incident.version });
                    }}
                >
                    Не инцидент
                </Button>
            </div>
        </article>
    );
}
