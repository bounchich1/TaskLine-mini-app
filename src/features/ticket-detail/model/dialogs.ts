export type TicketDialog = 'close' | 'transfer' | 'reopen' | 'discard';

/** A dialog that runs a ticket command (every one except `discard`). */
export type CommandDialog = Exclude<TicketDialog, 'discard'>;

export const DIALOG_TITLES: Readonly<Record<TicketDialog, string>> = {
  close: 'Закрыть обращение?',
  transfer: 'Передать обращение',
  reopen: 'Переоткрыть обращение',
  discard: 'Свернуть черновик?',
};

export const DIALOG_SUBMIT_LABELS: Readonly<Record<CommandDialog, string>> = {
  close: 'Закрыть',
  transfer: 'Передать',
  reopen: 'Переоткрыть',
};

/** The command a dialog sends, with its body. */
export function dialogCommand(dialog: CommandDialog, reason: string, target: string) {
  if (dialog === 'close') {
    return { action: 'close', body: { note: reason } };
  }
  if (dialog === 'transfer') {
    return { action: 'transfer', body: { employee_id: target, comment: reason } };
  }
  return { action: 'reopen', body: { reason } };
}

/** Whether the dialog's fields are incomplete (or, when closing, deliveries are pending). */
export function isDialogIncomplete(
  dialog: CommandDialog,
  { reason, target, unresolved }: { reason: string; target: string; unresolved: boolean },
) {
  if (dialog === 'close') {
    return unresolved;
  }
  if (dialog === 'transfer') {
    return !target || !reason.trim();
  }
  return !reason.trim();
}
