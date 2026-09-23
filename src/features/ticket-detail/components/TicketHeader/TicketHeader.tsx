import type { Ticket } from '@/shared/types/api';
import { Badge, Icon } from '@/shared/ui';

/** The card title: ticket number, status and the collapse button. */
export function TicketHeader({ ticket, onClose }: { ticket: Ticket; onClose: () => void }) {
  return (
    <div className="detail-heading">
      <div>
        <span className="eyebrow">КАРТОЧКА ОБРАЩЕНИЯ</span>
        <h2>
          №{ticket.number}
          <Badge status={ticket.status} />
        </h2>
      </div>
      <button className="icon-button" aria-label="Свернуть обращение" onClick={onClose}>
        <Icon name="close" />
      </button>
    </div>
  );
}
