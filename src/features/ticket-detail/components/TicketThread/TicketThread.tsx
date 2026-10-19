import type { RefObject } from 'react';

import type { useTicketCard } from '@/features/ticket-detail/hooks/use-ticket-card';
import { sortMessages } from '@/features/ticket-detail/model/messages';
import type { Employee, Session, Ticket } from '@/shared/types/api';
import type { Macro } from '@/shared/types/routing';
import { ErrorNotice } from '@/shared/ui';

import { Composer } from '../Composer/Composer';
import { Conversation } from '../Conversation/Conversation';
import { Description } from '../Description/Description';
import type { ticketAbilities } from '../TicketCard/ticket-abilities';

type TicketThreadProps = {
    ticket: Ticket;
    card: ReturnType<typeof useTicketCard>;
    abilities: ReturnType<typeof ticketAbilities>;
    session: Session;
    employees: Employee[];
    macros: Macro[];
    inputRef: RefObject<HTMLTextAreaElement | null>;
};

export function TicketThread({ ticket, card, abilities, session, employees, macros, inputRef }: TicketThreadProps) {
    const timezone = session.organization.timezone;
    const quiet = card.dialog !== null || card.collision !== null;

    return (
        <div className="ticket-card__thread">
            <div className="ticket-card__scroll">
                {quiet ? null : <ErrorNotice className="ticket-card__error" error={card.command.error} />}
                <Description ticket={ticket} />

                <Conversation
                    ticket={ticket}
                    messages={sortMessages(card.history.data?.pages)}
                    history={card.history}
                    timezone={timezone}
                    canAct={abilities.canAct}
                    canSend={abilities.canSend}
                    onChanged={card.refresh}
                    onError={card.uploads.setUploadError}
                />
            </div>

            <Composer
                ticket={ticket}
                draft={card.draft}
                setDraft={card.setDraft}
                inputRef={inputRef}
                canSend={abilities.canSend}
                canNote={abilities.canNote}
                pending={card.command.isPending}
                uploads={card.uploads}
                employees={employees}
                macros={macros}
                macroContext={abilities.macroContext(timezone)}
                me={session.employee.id}
                onTyping={card.typing}
                onSend={() => {
                    card.send();
                }}
            />
        </div>
    );
}
