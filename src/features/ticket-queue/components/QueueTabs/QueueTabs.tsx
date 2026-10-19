import { clsx } from 'clsx';

import type { QueueTab } from '@/features/ticket-queue/model/filter-defaults';
import type { TicketPage } from '@/shared/types/api';
import { Icon } from '@/shared/ui';

import './QueueTabs.scss';

const TABS: readonly (readonly [QueueTab, string])[] = [
    ['open', 'Открытые'],
    ['incident', 'Инциденты'],
    ['closed', 'Закрытые'],
];

type QueueTabsProps = {
    tab: QueueTab;
    counts: TicketPage['counts'] | undefined;
    onSelect: (tab: QueueTab) => void;
    riskOnly: boolean;
    onToggleRisk: () => void;
    changed: boolean;
    onAcknowledge: () => void;
};

export function QueueTabs(props: QueueTabsProps) {
    const { tab, counts, onSelect, riskOnly, changed, onAcknowledge } = props;
    const atRisk = counts?.at_risk ?? 0;
    const showRisk = tab === 'open' && (riskOnly || atRisk > 0);
    const tabs = TABS.filter(([value]) => value !== 'incident' || tab === 'incident' || Boolean(counts?.incident));

    return (
        <div className="queue-tabs">
            <div className="queue-tabs__list" role="tablist" aria-label="Статус обращений">
                {tabs.map(([value, label]) => (
                    <button
                        role="tab"
                        key={value}
                        aria-selected={tab === value}
                        className={clsx('queue-tabs__tab', tab === value && 'queue-tabs__tab--selected')}
                        onClick={() => {
                            onSelect(value);
                        }}
                    >
                        {label}
                        <span className="queue-tabs__count">{counts?.[value] ?? '–'}</span>
                    </button>
                ))}
            </div>

            {showRisk ? (
                <button
                    className={clsx('queue-tabs__risk', riskOnly && 'queue-tabs__risk--active')}
                    aria-pressed={riskOnly}
                    onClick={props.onToggleRisk}
                >
                    Под угрозой
                    <span className="queue-tabs__risk-count">{atRisk}</span>
                </button>
            ) : null}

            {changed ? (
                <button className="queue-tabs__notice" onClick={onAcknowledge}>
                    <Icon name="check" size={14} />
                    Очередь обновлена
                </button>
            ) : null}
        </div>
    );
}
