import { Input } from '@maxhub/max-ui';
import { clsx } from 'clsx';

import type { TicketFilters } from '@/features/ticket-queue/hooks/use-ticket-filters';
import { SORT_OPTIONS } from '@/features/ticket-queue/model/sort-options';
import { Icon } from '@/shared/ui';

import './QueueToolbar.scss';

/** Search box, the filters toggle and the sort order. */
export function QueueToolbar({ queue }: { queue: TicketFilters }) {
  return (
    <div className="queue-toolbar">
      <div className="queue-toolbar__search">
        <Input
          aria-label="Поиск по номеру или тексту"
          placeholder="Номер или текст обращения"
          value={queue.search}
          onChange={(event) => {
            queue.setSearch(event.target.value);
          }}
          iconBefore={<Icon name="search" size={19} />}
        />
      </div>
      <button
        className={clsx(
          'queue-toolbar__filter',
          queue.filterOpen && 'queue-toolbar__filter--selected',
        )}
        onClick={queue.toggleFilters}
        aria-expanded={queue.filterOpen}
      >
        <Icon className="queue-toolbar__filter-icon" name="filter" size={18} />
        Фильтры
      </button>
      <label className="queue-toolbar__sort">
        <span className="visually-hidden">Сортировка</span>
        <select
          className="queue-toolbar__sort-select"
          value={queue.filters.sort}
          onChange={(event) => {
            queue.change('sort', event.target.value);
          }}
        >
          {SORT_OPTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
