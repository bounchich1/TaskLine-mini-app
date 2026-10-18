import { ticketState } from '@/features/notifications/model/notification-copy';
import type { NotificationTicket } from '@/shared/types/api';
import { SlaChip, Urgency } from '@/shared/ui';

type NotificationTicketLinesProps = {
    ticket: NotificationTicket | null;
    detail: string | null;
    earlier: string | null;
    me: string;
    timezone: string;
};

export function NotificationTicketLines({ ticket, detail, earlier, me, timezone }: NotificationTicketLinesProps) {
    if (!ticket) {
        return <span className="notification-item__meta">Обращение недоступно</span>;
    }

    const classified = ticket.ai_status !== 'pending' && ticket.tag !== 'undefined';

    return (
        <>
            <span className="notification-item__subject">
                <span className="notification-item__number">№{ticket.number}</span>
                {classified ? <span className="notification-item__topic">{ticket.tag_label}</span> : null}
                <SlaChip ticket={ticket} timezone={timezone} />
            </span>

            {detail ? <span className="notification-item__detail">{detail}</span> : null}

            <span className="notification-item__meta">
                {classified ? <Urgency code={ticket.urgency} label={ticket.urgency_label} /> : null}
                <span>{ticketState(ticket, me)}</span>
                {earlier ? <span className="notification-item__earlier">{earlier}</span> : null}
            </span>
        </>
    );
}
