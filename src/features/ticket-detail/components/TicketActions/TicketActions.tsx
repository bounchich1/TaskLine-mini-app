import { Button } from '@maxhub/max-ui';

import type { TicketDialog } from '@/features/ticket-detail/model/dialogs';
import type { Ticket } from '@/shared/types/api';

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
  if (ticket.status === 'open') {
    return (
      <Button size="xsmall" loading={pending} onClick={onAssign}>
        Взять в работу
      </Button>
    );
  }
  if (!canAct) {
    return null;
  }
  if (ticket.status === 'in_progress') {
    return (
      <>
        <Button
          variant="secondary"
          size="xsmall"
          disabled={pending}
          onClick={() => {
            onOpenDialog('transfer');
          }}
        >
          Передать сотруднику
        </Button>
        <Button
          size="xsmall"
          disabled={pending}
          onClick={() => {
            onOpenDialog('close');
          }}
        >
          Закрыть обращение
        </Button>
      </>
    );
  }
  return active ? null : (
    <Button
      variant="secondary"
      size="xsmall"
      disabled={pending}
      onClick={() => {
        onOpenDialog('reopen');
      }}
    >
      Переоткрыть
    </Button>
  );
}
