import type { Ticket } from '@/shared/types/api';

import './Description.scss';

/** The client's first message in full: the problem the ticket is about. */
export function Description({ ticket }: { ticket: Ticket }) {
  return (
    <div className="description">
      <h3 className="description__label">Описание проблемы</h3>
      <p className="description__text">{ticket.description}</p>
    </div>
  );
}
