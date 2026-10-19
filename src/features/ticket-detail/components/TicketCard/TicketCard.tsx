import { useRef } from 'react';

import { useTicketCard } from '@/features/ticket-detail/hooks/use-ticket-card';
import { useTicketShortcuts } from '@/features/ticket-detail/hooks/use-ticket-shortcuts';
import { logTicketEvent } from '@/features/ticket-detail/hooks/use-viewing';
import { appendToDraft, type Draft } from '@/features/ticket-detail/model/draft';
import { MAX_REPLY_LENGTH } from '@/features/ticket-detail/model/limits';
import type { TicketNavigation } from '@/features/ticket-detail/model/navigation';
import { useMacros, useTeams } from '@/shared/api/reference-data';
import { can } from '@/shared/lib/access';
import type { Dictionary, Employee, Session } from '@/shared/types/api';

import { TicketActions } from '../TicketActions/TicketActions';
import { TicketAside } from '../TicketAside/TicketAside';
import { TicketCardDialogs } from '../TicketCardDialogs/TicketCardDialogs';
import { TicketHeader } from '../TicketHeader/TicketHeader';
import { TicketLoadFailed } from '../TicketLoadFailed/TicketLoadFailed';
import { TicketThread } from '../TicketThread/TicketThread';

import { ticketAbilities } from './ticket-abilities';

import './TicketCard.scss';

type TicketCardProps = {
    id: string;
    session: Session;
    employees: Employee[];
    dictionaries: Dictionary[];
    drafts: Map<string, Draft>;
    navigation: TicketNavigation;
    onClose: () => void;
};

export function TicketCard(props: TicketCardProps) {
    const { id, session, employees, dictionaries, drafts, navigation, onClose } = props;
    const card = useTicketCard({ id, drafts, me: session.employee.id, onClose });
    const { detail, setDraft, setDialog, command, operate } = card;
    const ticket = detail.data;
    const teams = useTeams();
    const macros = useMacros();
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const abilities = ticket ? ticketAbilities(session, ticket) : null;

    useTicketShortcuts({ inputRef, setDraft, abilities, openDialog: setDialog });

    if (detail.isPending) {
        return <div className="ticket-card ticket-card--loading">Загружаем обращение…</div>;
    }

    if (!ticket || !abilities) {
        return <TicketLoadFailed error={detail.error} onRetry={() => void detail.refetch()} />;
    }

    const pending = command.isPending;
    const canInsert = abilities.canSend && !pending;

    return (
        <section className="ticket-card" aria-label={`Обращение №${ticket.number}`}>
            <TicketHeader
                ticket={ticket}
                timezone={session.organization.timezone}
                me={session.employee.id}
                returnTo={navigation.returnTo}
                onReturn={navigation.goBack}
                onClose={card.requestClose}
            >
                <TicketActions
                    ticket={ticket}
                    active={abilities.active}
                    allowed={abilities.allowed}
                    pending={pending}
                    onOperate={operate}
                    onOpenDialog={setDialog}
                />
            </TicketHeader>

            <div className="ticket-card__panes">
                <TicketThread
                    ticket={ticket}
                    card={card}
                    abilities={abilities}
                    session={session}
                    employees={employees}
                    macros={macros}
                    inputRef={inputRef}
                />

                <TicketAside
                    ticket={ticket}
                    dictionaries={dictionaries}
                    teams={teams}
                    timezone={session.organization.timezone}
                    disabled={!abilities.active || pending || !abilities.canClassify}
                    canInsert={canInsert}
                    canManagePrivacy={can(session, 'clients.privacy')}
                    onClassify={(field, value) => {
                        operate('classification', {
                            [field]: value,
                            revisions: { [field]: ticket[`${field}_revision`] },
                        });
                    }}
                    onTeam={(teamId) => {
                        operate('team', { team_id: teamId });
                    }}
                    onInsertSuggestion={(text) => {
                        setDraft(appendToDraft(text, MAX_REPLY_LENGTH));
                        logTicketEvent(ticket.id, 'draft_inserted');
                    }}
                    onOpenSource={(sourceId) => {
                        navigation.openSource(sourceId, { id: ticket.id, number: ticket.number });
                    }}
                />
            </div>

            <TicketCardDialogs ticket={ticket} card={card} employees={employees} onClose={onClose} />
        </section>
    );
}
