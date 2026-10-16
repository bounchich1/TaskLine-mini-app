import { Button } from '@maxhub/max-ui';

import type { TicketDialog } from '@/features/ticket-detail/model/dialogs';
import type { Ticket } from '@/shared/types/api';

export type TicketPermissions = Record<'take' | 'wait' | 'transfer' | 'close' | 'reopen', boolean>;

type TicketActionsProps = {
    ticket: Ticket;
    active: boolean;
    allowed: TicketPermissions;
    pending: boolean;
    onOperate: (action: 'assign' | 'wait' | 'resume') => void;
    onOpenDialog: (dialog: TicketDialog) => void;
};

export function TicketActions({ ticket, active, allowed, pending, onOperate, onOpenDialog }: TicketActionsProps) {
    if (ticket.status === 'open') {
        return allowed.take ? (
            <Button
                size="xsmall"
                loading={pending}
                onClick={() => {
                    onOperate('assign');
                }}
            >
                Взять в работу
            </Button>
        ) : null;
    }

    if (ticket.status === 'in_progress') {
        const waiting = Boolean(ticket.waiting_since);

        return (
            <>
                {allowed.wait ? (
                    <Button
                        variant="secondary"
                        size="xsmall"
                        disabled={pending}
                        onClick={() => {
                            onOperate(waiting ? 'resume' : 'wait');
                        }}
                    >
                        {waiting ? 'Снять ожидание' : 'Ждём клиента'}
                    </Button>
                ) : null}

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
