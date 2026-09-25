import type { Dimension } from '@/shared/config/labels';
import type { Dictionary, Ticket } from '@/shared/types/api';

import { AiSuggestionPanel } from '../AiSuggestionPanel/AiSuggestionPanel';
import { ClassificationFields } from '../ClassificationFields/ClassificationFields';
import { ClosureHistory } from '../ClosureHistory/ClosureHistory';
import { TicketProperties } from '../TicketProperties/TicketProperties';

import './TicketAside.scss';

type TicketAsideProps = {
  ticket: Ticket;
  dictionaries: Dictionary[];
  timezone: string;
  /** Classification cannot change (closed ticket, or a command in flight). */
  disabled: boolean;
  /** The suggestion may be inserted into the draft. */
  canInsert: boolean;
  onClassify: (field: Dimension, value: string) => void;
  onInsertSuggestion: (text: string) => void;
};

/** The card's side column: properties and classification, the assistant, ratings. */
export function TicketAside(props: TicketAsideProps) {
  const { ticket, timezone } = props;
  return (
    <aside className="ticket-aside" aria-label="Свойства обращения">
      <section className="ticket-aside__section">
        <TicketProperties ticket={ticket} timezone={timezone}>
          <ClassificationFields
            ticket={ticket}
            dictionaries={props.dictionaries}
            disabled={props.disabled}
            onChange={props.onClassify}
          />
        </TicketProperties>
      </section>
      <section className="ticket-aside__section">
        <AiSuggestionPanel
          ticket={ticket}
          canInsert={props.canInsert}
          onInsert={props.onInsertSuggestion}
        />
      </section>
      {ticket.closures?.length ? (
        <section className="ticket-aside__section">
          <ClosureHistory closures={ticket.closures} timezone={timezone} />
        </section>
      ) : null}
    </aside>
  );
}
