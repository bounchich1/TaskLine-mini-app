import { Button } from '@maxhub/max-ui';
import { useState } from 'react';

import {
  DIALOG_SUBMIT_LABELS,
  DIALOG_TITLES,
  dialogCommand,
  isDialogIncomplete,
  type TicketDialog,
} from '@/features/ticket-detail/model/dialogs';
import type { Employee, Ticket } from '@/shared/types/api';
import { ErrorNotice, Modal } from '@/shared/ui';

import { TicketDialogBody } from '../TicketDialogBody/TicketDialogBody';

type TicketDialogsProps = {
  dialog: TicketDialog;
  ticket: Ticket;
  employees: Employee[];
  /** Some staff deliveries are still unconfirmed; the ticket cannot be closed yet. */
  unresolved: boolean;
  pending: boolean;
  error: unknown;
  onOperate: (action: string, body: unknown) => void;
  onDismiss: () => void;
  /** Collapse the card, keeping the draft. */
  onCollapse: () => void;
};

/** Confirmation dialogs of the ticket card: close, transfer, reopen, and discard-on-collapse. */
export function TicketDialogs(props: TicketDialogsProps) {
  const { dialog, ticket, employees, unresolved, pending, error } = props;
  const [reason, setReason] = useState('');
  const [target, setTarget] = useState('');
  const footer =
    dialog === 'discard' ? (
      <Button onClick={props.onCollapse}>Сохранить и свернуть</Button>
    ) : (
      <Button
        loading={pending}
        disabled={isDialogIncomplete(dialog, { reason, target, unresolved })}
        onClick={() => {
          const { action, body } = dialogCommand(dialog, reason, target);
          props.onOperate(action, body);
        }}
      >
        {DIALOG_SUBMIT_LABELS[dialog]}
      </Button>
    );
  return (
    <Modal title={DIALOG_TITLES[dialog]} onClose={props.onDismiss} busy={pending} footer={footer}>
      <ErrorNotice error={error} />
      <TicketDialogBody
        dialog={dialog}
        ticket={ticket}
        employees={employees}
        unresolved={unresolved}
        reason={reason}
        onReason={setReason}
        target={target}
        onTarget={setTarget}
      />
    </Modal>
  );
}
