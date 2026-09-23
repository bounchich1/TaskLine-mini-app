import { Button } from '@maxhub/max-ui';

import type { TicketDialog } from '@/features/ticket-detail/model/dialogs';
import type { Ticket } from '@/shared/types/api';
import { Icon } from '@/shared/ui';

type TicketActionsProps = {
  ticket: Ticket;
  active: boolean;
  canAct: boolean;
  pending: boolean;
  onAssign: () => void;
  onOpenDialog: (dialog: TicketDialog) => void;
};

/** Take into work, transfer, close or reopen, depending on the status and the employee. */
export function TicketActions({
  ticket,
  active,
  canAct,
  pending,
  onAssign,
  onOpenDialog,
}: TicketActionsProps) {
  return (
    <div className="ticket-actions">
      {ticket.status === 'open' ? (
        <Button size="small" loading={pending} onClick={onAssign}>
          Взять в работу
        </Button>
      ) : null}
      {ticket.status === 'in_progress' && canAct ? (
        <>
          <Button
            variant="secondary"
            size="small"
            disabled={pending}
            onClick={() => {
              onOpenDialog('transfer');
            }}
          >
            Передать сотруднику
          </Button>
          <Button
            variant="primary"
            size="small"
            disabled={pending}
            onClick={() => {
              onOpenDialog('close');
            }}
            iconBefore={<Icon name="check" size={16} />}
          >
            Закрыть обращение
          </Button>
        </>
      ) : null}
      {!active && canAct ? (
        <Button
          variant="secondary"
          size="small"
          disabled={pending}
          onClick={() => {
            onOpenDialog('reopen');
          }}
        >
          Переоткрыть
        </Button>
      ) : null}
    </div>
  );
}
