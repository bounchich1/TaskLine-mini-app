import { Button } from '@maxhub/max-ui';

import { ErrorNotice } from '@/shared/ui';

/** Shown in place of the card when the ticket could not be loaded. */
export function TicketLoadFailed({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  return (
    <div className="ticket-card">
      <ErrorNotice error={error} />
      <Button variant="secondary" onClick={onRetry}>
        Повторить
      </Button>
    </div>
  );
}
