import { Button } from '@maxhub/max-ui';

import type { TicketDialog } from '@/features/ticket-detail/model/dialogs';
import type { Ticket } from '@/shared/types/api';

export type TicketPermissions = Record<'take' | 'transfer' | 'close' | 'reopen', boolean>;

type TicketActionsProps = {
    ticket: Ticket;
    active: boolean;
    allowed: TicketPermissions;
    pending: boolean;
    onAssign: () => void;
    onOpenDialog: (dialog: TicketDialog) => void;
};

export function TicketActions({ ticket, active, allowed, pending, onAssign, onOpenDialog }: TicketActionsProps) {
    if (ticket.status === 'open') {
        return allowed.take ? (
            <Button size="xsmall" loading={pending} onClick={onAssign}>
                Взять в работу
            </Button>
        ) : null;
    }

    if (ticket.status === 'in_progress') {
        return (
            <>
                {allowed.transfer ? (
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
                ) : null}

                {allowed.close ? (
                    <Button
                        size="xsmall"
                        disabled={pending}
                        onClick={() => {
                            onOpenDialog('close');
                        }}
                    >
                        Закрыть обращение
                    </Button>
                ) : null}
            </>
        );
    }

    return active || !allowed.reopen ? null : (
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
