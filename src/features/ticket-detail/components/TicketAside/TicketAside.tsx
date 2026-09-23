import type { TicketDialog } from '@/features/ticket-detail/model/dialogs';
import type { Dictionary, Ticket } from '@/shared/types/api';

import { AiSuggestionPanel } from '../AiSuggestionPanel/AiSuggestionPanel';
import { ClassificationFields } from '../ClassificationFields/ClassificationFields';
import { ClosureHistory } from '../ClosureHistory/ClosureHistory';
import { TicketActions } from '../TicketActions/TicketActions';
import { TicketProperties } from '../TicketProperties/TicketProperties';

import './TicketAside.scss';

type TicketAsideProps = {
  ticket: Ticket;
  dictionaries: Dictionary[];
  timezone: string;
  /** The ticket is open or in progress. */
  active: boolean;
  canAct: boolean;
  canSend: boolean;
  /** A command is in flight. */
  pending: boolean;
  operate: (action: string, body?: unknown) => void;
  onOpenDialog: (dialog: TicketDialog) => void;
  onInsertSuggestion: (text: string) => void;
};

/** The card's side column: properties and actions, the assistant, and the closure history. */
export function TicketAside(props: TicketAsideProps) {
  const { ticket, active, canAct, pending, operate } = props;
  const canInsert = props.canSend && !pending;
  return (
    <aside className="ticket-aside">
      <TicketProperties ticket={ticket}>
        <ClassificationFields
          ticket={ticket}
          dictionaries={props.dictionaries}
          disabled={!active || pending}
          onChange={(field, value) => {
            operate('classification', {
              [field]: value,
              revisions: { [field]: ticket[`${field}_revision`] },
            });
          }}
        />
        <TicketActions
          ticket={ticket}
          active={active}
          canAct={canAct}
          pending={pending}
          onAssign={() => {
            operate('assign');
          }}
          onOpenDialog={props.onOpenDialog}
        />
      </TicketProperties>
      <AiSuggestionPanel
        ticket={ticket}
        canInsert={canInsert}
        onInsert={props.onInsertSuggestion}
      />
      {ticket.closures?.length ? (
        <ClosureHistory closures={ticket.closures} timezone={props.timezone} />
      ) : null}
    </aside>
  );
}
