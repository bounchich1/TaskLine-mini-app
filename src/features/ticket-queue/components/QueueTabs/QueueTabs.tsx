import type { QueueTab } from '@/features/ticket-queue/model/filter-defaults';
import type { TicketPage } from '@/shared/types/api';
import { Icon } from '@/shared/ui';

const TABS: readonly (readonly [QueueTab, string])[] = [
  ['open', 'Открытые'],
  ['closed', 'Закрытые'],
];

type QueueTabsProps = {
  tab: QueueTab;
  counts: TicketPage['counts'] | undefined;
  onSelect: (tab: QueueTab) => void;
  /** The live stream reported changes since the employee last looked. */
  changed: boolean;
  onAcknowledge: () => void;
};

/** Open / closed tabs and the "data updated" notice. */
export function QueueTabs({ tab, counts, onSelect, changed, onAcknowledge }: QueueTabsProps) {
  return (
    <div className="queue-tabs">
      <div role="tablist" aria-label="Статус обращений">
        {TABS.map(([value, label]) => (
          <button
            role="tab"
            key={value}
            aria-selected={tab === value}
            className={tab === value ? 'queue-tab selected' : 'queue-tab'}
            onClick={() => {
              onSelect(value);
            }}
          >
            {label}
            <span>{counts?.[value] ?? 0}</span>
          </button>
        ))}
      </div>
      <span className="queue-subtitle">
        {changed ? (
          <button className="text-button" onClick={onAcknowledge}>
            Данные обновлены <Icon name="check" size={14} />
          </button>
        ) : (
          'Единая очередь команды'
        )}
      </span>
    </div>
  );
}
