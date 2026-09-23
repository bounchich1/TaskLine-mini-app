import type { Ticket } from '@/shared/types/api';
import { Badge, Icon } from '@/shared/ui';

import './TicketHeader.scss';

/** The card title: ticket number, status and the collapse button. */
export function TicketHeader({ ticket, onClose }: { ticket: Ticket; onClose: () => void }) {
  return (
    <div className="ticket-header">
      <div>
        <span className="ticket-header__eyebrow">КАРТОЧКА ОБРАЩЕНИЯ</span>
        <h2 className="ticket-header__title">
          №{ticket.number}
          <Badge status={ticket.status} />
        </h2>
      </div>
      <button className="ticket-header__close" aria-label="Свернуть обращение" onClick={onClose}>
        <Icon name="close" />
      </button>
    </div>
  );
}
