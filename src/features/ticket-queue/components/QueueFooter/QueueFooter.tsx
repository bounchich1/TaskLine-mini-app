import { Button } from '@maxhub/max-ui';

import type { TicketList } from '@/features/ticket-queue/hooks/use-ticket-list';

import './QueueFooter.scss';

type QueueFooterProps = {
  ticketList: TicketList;
  /** Tickets in the current tab with the current filters. */
  total: number | undefined;
};

/** How many tickets are shown, and "show more" while there are further pages. */
export function QueueFooter({ ticketList, total }: QueueFooterProps) {
  const { list, rows } = ticketList;
  return (
    <div className="queue-footer">
      <span>
        Показано {rows.length}
        {total === undefined ? null : ` из ${total}`}
      </span>
      {list.hasNextPage ? (
        <Button
          variant="secondary"
          size="xsmall"
          loading={list.isFetchingNextPage}
          onClick={() => void list.fetchNextPage()}
        >
          Показать ещё
        </Button>
      ) : null}
    </div>
  );
}
