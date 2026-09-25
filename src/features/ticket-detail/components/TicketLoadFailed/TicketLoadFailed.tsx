import { Button } from '@maxhub/max-ui';

import { ErrorNotice } from '@/shared/ui';

export function TicketLoadFailed({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  return (
    <div className="ticket-card ticket-card--failed">
      <ErrorNotice error={error} />
      <Button variant="secondary" onClick={onRetry}>
        Повторить
      </Button>
    </div>
  );
}
