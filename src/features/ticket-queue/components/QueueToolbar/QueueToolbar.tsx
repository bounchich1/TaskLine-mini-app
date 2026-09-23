import { Input } from '@maxhub/max-ui';

import type { TicketFilters } from '@/features/ticket-queue/hooks/use-ticket-filters';
import { SORT_OPTIONS } from '@/features/ticket-queue/model/sort-options';
import { Icon } from '@/shared/ui';

/** Search box, the filters toggle and the sort order. */
export function QueueToolbar({ queue }: { queue: TicketFilters }) {
  return (
    <div className="toolbar">
      <div className="search">
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
        className={`filter-button ${queue.filterOpen ? 'selected' : ''}`}
        onClick={queue.toggleFilters}
        aria-expanded={queue.filterOpen}
      >
        <Icon name="filter" size={18} />
        Фильтры
      </button>
      <label className="sort-label">
        <span className="sr-only">Сортировка</span>
        <select
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
