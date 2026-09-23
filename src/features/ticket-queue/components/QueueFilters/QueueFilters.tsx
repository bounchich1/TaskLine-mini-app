import type { TicketFilters } from '@/features/ticket-queue/hooks/use-ticket-filters';
import type { Filters } from '@/features/ticket-queue/model/filter-defaults';
import { DIMENSION_LABELS, DIMENSIONS, STATUS_LABELS } from '@/shared/config/labels';
import type { Dictionary, Employee } from '@/shared/types/api';
import { DictionarySelect } from '@/shared/ui';

type QueueFiltersProps = {
  queue: TicketFilters;
  dictionaries: Dictionary[] | undefined;
  employees: Employee[] | undefined;
};

/** The expanded filter panel. */
export function QueueFilters({ queue, dictionaries, employees }: QueueFiltersProps) {
  const { filters, change } = queue;
  const onChange = (name: keyof Filters) => (event: { target: { value: string } }) => {
    change(name, event.target.value);
  };
  return (
    <div className="filters">
      {DIMENSIONS.map((dimension) => (
        <label key={dimension}>
          {DIMENSION_LABELS[dimension]}
          <DictionarySelect
            items={dictionaries}
            dimension={dimension}
            value={filters[dimension]}
            onChange={(value) => {
              change(dimension, value);
            }}
            emptyLabel="Все"
          />
        </label>
      ))}
      <label>
        Статус
        <select value={filters.status} onChange={onChange('status')}>
          <option value="">Все</option>
          {Object.entries(STATUS_LABELS).map(([code, label]) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Исполнитель
        <select value={filters.assignee} onChange={onChange('assignee')}>
          <option value="">Все сотрудники</option>
          {employees?.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        С даты
        <input type="date" value={filters.from} onChange={onChange('from')} />
      </label>
      <label>
        По дату
        <input type="date" value={filters.to} onChange={onChange('to')} />
      </label>
      <button className="text-button" onClick={queue.reset}>
        Сбросить
      </button>
    </div>
  );
}
