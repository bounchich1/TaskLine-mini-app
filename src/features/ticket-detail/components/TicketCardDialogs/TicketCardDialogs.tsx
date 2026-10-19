import type { useTicketCard } from '@/features/ticket-detail/hooks/use-ticket-card';
import { hasUnresolvedDelivery, sortMessages } from '@/features/ticket-detail/model/messages';
import type { Employee, Ticket } from '@/shared/types/api';

import { CollisionDialog } from '../CollisionDialog/CollisionDialog';
import { TicketDialogs } from '../TicketDialogs/TicketDialogs';

type TicketCardDialogsProps = {
    ticket: Ticket;
    card: ReturnType<typeof useTicketCard>;
    employees: Employee[];
    onClose: () => void;
};

export function TicketCardDialogs({ ticket, card, employees, onClose }: TicketCardDialogsProps) {
    const { dialog, setDialog, command, operate } = card;

    if (card.collision) {
        return (
            <CollisionDialog
                message={card.collision}
                pending={command.isPending}
                onSend={() => {
                    card.send(true);
                }}
                onCancel={() => {
                    command.reset();
                }}
            />
        );
    }

    return dialog ? (
        <TicketDialogs
            dialog={dialog}
            ticket={ticket}
            employees={employees}
            unresolved={hasUnresolvedDelivery(sortMessages(card.history.data?.pages))}
            pending={command.isPending}
            error={command.error}
            onOperate={operate}
            onDismiss={() => {
                setDialog(null);
            }}
            onCollapse={() => {
                setDialog(null);
                onClose();
            }}
        />
    ) : null;
}
