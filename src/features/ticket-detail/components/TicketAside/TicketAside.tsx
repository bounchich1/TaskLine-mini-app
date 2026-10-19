import type { Dimension } from '@/shared/config/labels';
import type { Dictionary, Ticket } from '@/shared/types/api';
import type { Team } from '@/shared/types/routing';

import { AiSuggestionPanel } from '../AiSuggestionPanel/AiSuggestionPanel';
import { ClassificationFields } from '../ClassificationFields/ClassificationFields';
import { ClientPrivacy } from '../ClientPrivacy/ClientPrivacy';
import { ClosureHistory } from '../ClosureHistory/ClosureHistory';
import { TeamField } from '../TeamField/TeamField';
import { TicketProperties } from '../TicketProperties/TicketProperties';

import './TicketAside.scss';

type TicketAsideProps = {
    ticket: Ticket;
    dictionaries: Dictionary[];
    teams: Team[];
    timezone: string;
    disabled: boolean;
    canInsert: boolean;
    canManagePrivacy: boolean;
    onClassify: (field: Dimension, value: string) => void;
    onTeam: (teamId: string | null) => void;
    onInsertSuggestion: (text: string) => void;
    onOpenSource: (sourceId: string) => void;
};

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

                    <TeamField ticket={ticket} teams={props.teams} disabled={props.disabled} onChange={props.onTeam} />
                </TicketProperties>
            </section>

            <section className="ticket-aside__section">
                <AiSuggestionPanel
                    ticket={ticket}
                    timezone={timezone}
                    canInsert={props.canInsert}
                    onInsert={props.onInsertSuggestion}
                    onOpenSource={props.onOpenSource}
                />
            </section>

            {ticket.closures?.length ? (
                <section className="ticket-aside__section">
                    <ClosureHistory closures={ticket.closures} timezone={timezone} />
                </section>
            ) : null}

            {props.canManagePrivacy ? (
                <section className="ticket-aside__section">
                    <ClientPrivacy key={ticket.client_id} ticket={ticket} />
                </section>
            ) : null}
        </aside>
    );
}
