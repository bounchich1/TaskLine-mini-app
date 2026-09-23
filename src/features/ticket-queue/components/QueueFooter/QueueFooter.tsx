import { Button } from '@maxhub/max-ui';

import type { TicketList } from '@/features/ticket-queue/hooks/use-ticket-list';

/** How many tickets are shown, and "show more" while there are further pages. */
export function QueueFooter({
  ticketList,
  timezone,
}: {
  ticketList: TicketList;
  timezone: string;
}) {
  const { list, rows } = ticketList;
  return (
    <div className="queue-footer">
      <span>Показано {rows.length} обращений</span>
      {list.hasNextPage ? (
        <Button
          variant="secondary"
          size="small"
          loading={list.isFetchingNextPage}
          onClick={() => void list.fetchNextPage()}
        >
          Показать ещё
        </Button>
      ) : (
        <span>Часовой пояс: {timezone}</span>
      )}
    </div>
  );
}
