import type { QueueTab } from '@/features/ticket-queue/model/filter-defaults';
import type { Ticket } from '@/shared/types/api';
import { Empty } from '@/shared/ui';

import { TicketList } from '../TicketList/TicketList';
import { TicketTable } from '../TicketTable/TicketTable';

import './QueueContent.scss';

type QueueContentProps = {
  rows: Ticket[];
  loading: boolean;
  searching: boolean;
  compact: boolean;
  tab: QueueTab;
  timezone: string;
  expanded: string | null;
  onToggle: (id: string) => void;
};

export function QueueContent({ rows, loading, searching, compact, ...view }: QueueContentProps) {
  if (loading) {
    return (
      <div className="queue-content__skeleton" aria-label="Загрузка обращений">
        {[1, 2, 3, 4, 5].map((i) => (
          <div className="queue-content__skeleton-row" key={i} />
        ))}
      </div>
    );
  }
  if (rows.length === 0) {
    return (
      <Empty title={searching ? 'Ничего не найдено' : 'Обращений нет'}>
        {searching
          ? 'Измените запрос или сбросьте фильтры.'
          : 'Новые обращения появятся здесь автоматически.'}
      </Empty>
    );
  }
  return compact ? <TicketList rows={rows} {...view} /> : <TicketTable rows={rows} {...view} />;
}
