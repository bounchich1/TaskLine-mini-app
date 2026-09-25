import type { TicketFilters } from '@/features/ticket-queue/hooks/use-ticket-filters';
import type { Filters } from '@/features/ticket-queue/model/filter-defaults';
import { DIMENSION_LABELS, DIMENSIONS, STATUS_LABELS, statusLabel } from '@/shared/config/labels';
import type { Dictionary, Employee } from '@/shared/types/api';
import { DatePicker, DictionarySelect, Select } from '@/shared/ui';

import './QueueFilters.scss';

type QueueFiltersProps = {
    queue: TicketFilters;
    dictionaries: Dictionary[] | undefined;
    employees: Employee[] | undefined;
};

export function QueueFilters({ queue, dictionaries, employees }: QueueFiltersProps) {
    const { filters, change } = queue;

    const onChange = (name: keyof Filters) => (value: string) => {
        change(name, value);
    };

    const statuses = [
        { value: '', label: 'Все' },
        ...Object.keys(STATUS_LABELS).map((value) => ({ value, label: statusLabel(value) })),
    ];

    const assignees = [
        { value: '', label: 'Все' },
        ...(employees ?? []).map((employee) => ({ value: employee.id, label: employee.name })),
    ];

    return (
        <div className="queue-filters">
            {DIMENSIONS.map((dimension) => (
                <label className="queue-filters__field" key={dimension}>
                    {DIMENSION_LABELS[dimension]}

                    <DictionarySelect
                        items={dictionaries}
                        dimension={dimension}
                        value={filters[dimension]}
                        onChange={onChange(dimension)}
                        emptyLabel="Все"
                    />
                </label>
            ))}

            <label className="queue-filters__field">
                Статус
                <Select options={statuses} value={filters.status} onChange={onChange('status')} />
            </label>

            <label className="queue-filters__field">
                Исполнитель
                <Select options={assignees} value={filters.assignee} onChange={onChange('assignee')} />
            </label>

            <label className="queue-filters__field">
                С даты
                <DatePicker value={filters.from} max={filters.to} placeholder="Любая" onChange={onChange('from')} />
            </label>

            <label className="queue-filters__field">
                По дату
                <DatePicker value={filters.to} min={filters.from} placeholder="Любая" onChange={onChange('to')} />
            </label>

            <button className="queue-filters__reset" onClick={queue.reset}>
                Сбросить фильтры
            </button>
        </div>
    );
}
