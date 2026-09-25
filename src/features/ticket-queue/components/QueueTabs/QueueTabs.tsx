import { clsx } from 'clsx';

import type { QueueTab } from '@/features/ticket-queue/model/filter-defaults';
import type { TicketPage } from '@/shared/types/api';
import { Icon } from '@/shared/ui';

import './QueueTabs.scss';

const TABS: readonly (readonly [QueueTab, string])[] = [
  ['open', 'Открытые'],
  ['closed', 'Закрытые'],
];

type QueueTabsProps = {
  tab: QueueTab;
  counts: TicketPage['counts'] | undefined;
  onSelect: (tab: QueueTab) => void;
  changed: boolean;
  onAcknowledge: () => void;
};

export function QueueTabs({ tab, counts, onSelect, changed, onAcknowledge }: QueueTabsProps) {
  return (
    <div className="queue-tabs">
      <div className="queue-tabs__list" role="tablist" aria-label="Статус обращений">
        {TABS.map(([value, label]) => (
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
      {changed ? (
        <button className="queue-tabs__notice" onClick={onAcknowledge}>
          <Icon name="check" size={14} />
          Очередь обновлена
        </button>
      ) : null}
    </div>
  );
}
