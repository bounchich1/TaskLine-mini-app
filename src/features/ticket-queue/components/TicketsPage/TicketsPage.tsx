import { Button } from '@maxhub/max-ui';
import type { Dispatch, ReactNode, SetStateAction } from 'react';

import { TicketCard, type Draft } from '@/features/ticket-detail';
import type { TicketFilters } from '@/features/ticket-queue/hooks/use-ticket-filters';
import type { TicketList } from '@/features/ticket-queue/hooks/use-ticket-list';
import type { Dictionary, Employee, Session } from '@/shared/types/api';
import { Empty, ErrorNotice, Icon, PageHeading } from '@/shared/ui';

import { QueueFilters } from '../QueueFilters/QueueFilters';
import { QueueFooter } from '../QueueFooter/QueueFooter';
import { QueueTabs } from '../QueueTabs/QueueTabs';
import { QueueToolbar } from '../QueueToolbar/QueueToolbar';
import { SummaryCards } from '../SummaryCards/SummaryCards';
import { TicketTable } from '../TicketTable/TicketTable';

import './TicketsPage.scss';

type TicketsPageProps = {
  session: Session;
  drafts: Map<string, Draft>;
  queue: TicketFilters;
  ticketList: TicketList;
  dictionaries: Dictionary[] | undefined;
  employees: Employee[] | undefined;
  expanded: string | null;
  onExpand: Dispatch<SetStateAction<string | null>>;
  /** The live stream reported changes since the employee last looked. */
  changed: boolean;
  onRefresh: () => void;
  onAcknowledge: () => void;
};

/** The ticket queue: totals, tabs, search and filters, and the table with the expanded ticket. */
export function TicketsPage(props: TicketsPageProps) {
  const { session, queue, ticketList, expanded, onExpand } = props;
  const { list, rows, counts } = ticketList;
  const timezone = session.organization.timezone;
  const card = expanded ? (
    <TicketCard
      id={expanded}
      session={session}
      employees={props.employees ?? []}
      dictionaries={props.dictionaries ?? []}
      drafts={props.drafts}
      onClose={() => {
        onExpand(null);
      }}
    />
  ) : null;
  const searching = Boolean(queue.filters.q) || queue.filterOpen;
  let content: ReactNode;
  if (list.isPending) {
    content = (
      <div className="tickets-page__skeleton" aria-label="Загрузка обращений">
        {[1, 2, 3, 4].map((i) => (
          <div className="tickets-page__skeleton-row" key={i} />
        ))}
      </div>
    );
  } else if (rows.length === 0) {
    content = (
      <Empty title={searching ? 'Ничего не найдено' : 'Очередь свободна'}>
        {searching
          ? 'Попробуйте изменить поиск или фильтры.'
          : 'Новые обращения появятся здесь автоматически.'}
      </Empty>
    );
  } else {
    content = (
      <TicketTable
        rows={rows}
        tab={queue.filters.tab}
        timezone={timezone}
        expanded={expanded}
        onExpand={onExpand}
        detail={card}
      />
    );
  }
  return (
    <>
      <PageHeading
        eyebrow="ПОДДЕРЖКА КЛИЕНТОВ"
        title="Обращения"
        description="Каждый вопрос — начало решения."
        action={
          <Button
            variant="secondary"
            size="small"
            iconBefore={<Icon name="refresh" size={16} />}
            onClick={props.onRefresh}
          >
            Обновить
          </Button>
        }
      />
      <SummaryCards counts={counts} />
      <section className="tickets-page__queue" aria-label="Очередь обращений">
        <QueueTabs
          tab={queue.filters.tab}
          counts={counts}
          onSelect={queue.selectTab}
          changed={props.changed}
          onAcknowledge={props.onAcknowledge}
        />
        <QueueToolbar queue={queue} />
        {queue.filterOpen ? (
          <QueueFilters
            queue={queue}
            dictionaries={props.dictionaries}
            employees={props.employees}
          />
        ) : null}
        <ErrorNotice error={list.error} />
        {content}
        {expanded && !rows.some((row) => row.id === expanded) ? card : null}
        <QueueFooter ticketList={ticketList} timezone={timezone} />
      </section>
      <p className="tickets-page__privacy">
        <Icon className="tickets-page__privacy-icon" name="user" size={14} />
        Ответы клиентам отправляются от имени бота. Данные сотрудников остаются внутри команды.
      </p>
    </>
  );
}
