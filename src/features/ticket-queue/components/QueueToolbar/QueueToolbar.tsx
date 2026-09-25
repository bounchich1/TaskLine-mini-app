import { Input } from '@maxhub/max-ui';
import { clsx } from 'clsx';

import type { TicketFilters } from '@/features/ticket-queue/hooks/use-ticket-filters';
import { SORT_OPTIONS } from '@/features/ticket-queue/model/sort-options';
import { Icon, Select } from '@/shared/ui';

import './QueueToolbar.scss';

export function QueueToolbar({ queue }: { queue: TicketFilters }) {
  return (
    <div className="queue-toolbar">
      <div className="queue-toolbar__search">
        <Input
          size="medium"
          aria-label="Поиск по номеру или тексту"
          placeholder="Номер или текст"
          value={queue.search}
          onChange={(event) => {
            queue.setSearch(event.target.value);
          }}
          iconBefore={<Icon name="search" size={18} />}
        />
      </div>
      <button
        className={clsx(
          'queue-toolbar__filter',
          (queue.filterOpen || queue.activeFilters > 0) && 'queue-toolbar__filter--active',
        )}
        onClick={queue.toggleFilters}
        aria-expanded={queue.filterOpen}
      >
        <Icon name="filter" size={18} />
        <span className="queue-toolbar__filter-label">Фильтры</span>
        {queue.activeFilters > 0 ? (
          <span className="queue-toolbar__filter-count">{queue.activeFilters}</span>
        ) : null}
      </button>
      <Select
        className="queue-toolbar__sort"
        size="large"
        aria-label="Сортировка"
        options={SORT_OPTIONS}
        value={queue.filters.sort}
        onChange={(value) => {
          queue.change('sort', value);
        }}
      />
    </div>
  );
}
