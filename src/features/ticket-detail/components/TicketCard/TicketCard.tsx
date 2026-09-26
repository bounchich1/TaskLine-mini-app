import { useTicketCard } from '@/features/ticket-detail/hooks/use-ticket-card';
import { appendToDraft, draftMessage, type Draft } from '@/features/ticket-detail/model/draft';
import { MAX_REPLY_LENGTH } from '@/features/ticket-detail/model/limits';
import { hasUnresolvedDelivery, sortMessages } from '@/features/ticket-detail/model/messages';
import { canOnTicket } from '@/shared/lib/access';
import type { Dictionary, Employee, Session } from '@/shared/types/api';
import { ErrorNotice } from '@/shared/ui';

import { Composer } from '../Composer/Composer';
import { Conversation } from '../Conversation/Conversation';
import { Description } from '../Description/Description';
import { TicketActions, type TicketPermissions } from '../TicketActions/TicketActions';
import { TicketAside } from '../TicketAside/TicketAside';
import { TicketDialogs } from '../TicketDialogs/TicketDialogs';
import { TicketHeader } from '../TicketHeader/TicketHeader';
import { TicketLoadFailed } from '../TicketLoadFailed/TicketLoadFailed';

import './TicketCard.scss';

type TicketCardProps = {
    id: string;
    session: Session;
    employees: Employee[];
    dictionaries: Dictionary[];
    drafts: Map<string, Draft>;
    onClose: () => void;
};

export function TicketCard({ id, session, employees, dictionaries, drafts, onClose }: TicketCardProps) {
    const card = useTicketCard(id, drafts, onClose);
    const { detail, history, draft, setDraft, uploads, dialog, setDialog, command, operate } = card;
    const ticket = detail.data;

    if (detail.isPending) {
        return <div className="ticket-card ticket-card--loading">Загружаем обращение…</div>;
    }

    if (!ticket) {
        return <TicketLoadFailed error={detail.error} onRetry={() => void detail.refetch()} />;
    }

    const timezone = session.organization.timezone;
    const active = ['open', 'in_progress'].includes(ticket.status);

    const allowed: TicketPermissions = {
        take: canOnTicket(session, ticket, 'take'),
        transfer: canOnTicket(session, ticket, 'transfer'),
        close: canOnTicket(session, ticket, 'close'),
        reopen: canOnTicket(session, ticket, 'reopen'),
    };

    const canAct = canOnTicket(session, ticket, 'reply');
    const canSend = ticket.status === 'in_progress' && canAct;
    const canClassify = canOnTicket(session, ticket, 'classify');
    const messages = sortMessages(history.data?.pages);
    const pending = command.isPending;
    const canInsert = canSend && !pending;

    return (
        <section className="ticket-card" aria-label={`Обращение №${ticket.number}`}>
            <TicketHeader ticket={ticket} onClose={card.requestClose}>
                <TicketActions
                    ticket={ticket}
                    active={active}
                    allowed={allowed}
                    pending={pending}
                    onAssign={() => {
                        operate('assign');
                    }}
                    onOpenDialog={setDialog}
                />
            </TicketHeader>

            <div className="ticket-card__panes">
                <div className="ticket-card__thread">
                    <div className="ticket-card__scroll">
                        {dialog ? null : <ErrorNotice className="ticket-card__error" error={command.error} />}
                        <Description ticket={ticket} />

                        <Conversation
                            ticket={ticket}
                            messages={messages}
                            history={history}
                            timezone={timezone}
                            canAct={canAct}
                            canSend={canSend}
                            onChanged={card.refresh}
                            onError={uploads.setUploadError}
                        />
                    </div>

                    <Composer
                        ticket={ticket}
                        draft={draft}
                        setDraft={setDraft}
                        canSend={canSend}
                        pending={pending}
                        uploads={uploads}
                        onSend={() => {
                            operate('messages', draftMessage(draft));
                        }}
                    />
                </div>

                <TicketAside
                    ticket={ticket}
                    dictionaries={dictionaries}
                    timezone={timezone}
                    disabled={!active || pending || !canClassify}
                    canInsert={canInsert}
                    onClassify={(field, value) => {
                        operate('classification', {
                            [field]: value,
                            revisions: { [field]: ticket[`${field}_revision`] },
                        });
                    }}
                    onInsertSuggestion={(text) => {
                        setDraft(appendToDraft(text, MAX_REPLY_LENGTH));
                    }}
                />
            </div>

            {dialog ? (
                <TicketDialogs
                    dialog={dialog}
                    ticket={ticket}
                    employees={employees}
                    unresolved={hasUnresolvedDelivery(messages)}
                    pending={pending}
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
            ) : null}
        </section>
    );
}
