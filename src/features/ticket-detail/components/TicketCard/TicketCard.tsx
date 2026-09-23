import { useCallback, useEffect, useState } from 'react';

import { useAttachmentUpload } from '@/features/ticket-detail/hooks/use-attachment-upload';
import { useDraft, useDraftGuard } from '@/features/ticket-detail/hooks/use-draft';
import { useRefreshTicket, useTicket } from '@/features/ticket-detail/hooks/use-ticket';
import { useTicketCommand } from '@/features/ticket-detail/hooks/use-ticket-command';
import { useTicketMessages } from '@/features/ticket-detail/hooks/use-ticket-messages';
import type { TicketDialog } from '@/features/ticket-detail/model/dialogs';
import {
  appendToDraft,
  draftMessage,
  emptyDraft,
  isDraftDirty,
  type Draft,
} from '@/features/ticket-detail/model/draft';
import { MAX_REPLY_LENGTH } from '@/features/ticket-detail/model/limits';
import { hasUnresolvedDelivery, sortMessages } from '@/features/ticket-detail/model/messages';
import { bindBack } from '@/shared/platform/max-bridge';
import type { Dictionary, Employee, Session } from '@/shared/types/api';
import { ErrorNotice } from '@/shared/ui';

import { Composer } from '../Composer/Composer';
import { Conversation } from '../Conversation/Conversation';
import { ProblemBlock } from '../ProblemBlock/ProblemBlock';
import { TicketAside } from '../TicketAside/TicketAside';
import { TicketDialogs } from '../TicketDialogs/TicketDialogs';
import { TicketHeader } from '../TicketHeader/TicketHeader';
import { TicketLoadFailed } from '../TicketLoadFailed/TicketLoadFailed';

type TicketCardProps = {
  id: string;
  session: Session;
  employees: Employee[];
  dictionaries: Dictionary[];
  /** Unsent drafts by ticket id; owned by the app so they survive collapsing the card. */
  drafts: Map<string, Draft>;
  onClose: () => void;
};

/** An expanded ticket: conversation, reply composer, properties, assistant and dialogs. */
export function TicketCard({
  id,
  session,
  employees,
  dictionaries,
  drafts,
  onClose,
}: TicketCardProps) {
  const detail = useTicket(id);
  const history = useTicketMessages(id);
  const [draft, setDraft] = useDraft(id, drafts);
  const ticket = detail.data;
  const uploads = useAttachmentUpload({
    ticketId: ticket?.id,
    uploadCount: draft.uploads.length,
    setDraft,
  });
  const [dialog, setDialog] = useState<TicketDialog | null>(null);
  const refresh = useRefreshTicket(id);
  const { command, operate } = useTicketCommand({
    id,
    version: ticket?.version,
    refresh,
    onDone: (action) => {
      setDialog(null);
      if (action === 'messages') {
        setDraft(emptyDraft());
      }
    },
  });
  const dirty = isDraftDirty(draft, uploads.uploading);
  useDraftGuard(id, drafts, draft, dirty);
  const requestClose = useCallback(() => {
    if (dirty) {
      setDialog('discard');
    } else {
      onClose();
    }
  }, [dirty, onClose]);
  useEffect(() => bindBack(requestClose), [requestClose]);
  if (detail.isPending) {
    return <div className="ticket-detail loading">Загружаем переписку…</div>;
  }
  if (!ticket) {
    return <TicketLoadFailed error={detail.error} onRetry={() => void detail.refetch()} />;
  }
  const timezone = session.organization.timezone;
  const active = ['open', 'in_progress'].includes(ticket.status);
  const canAct = ticket.assignee_id === session.employee.id || session.capabilities.act_on_others;
  const canSend = ticket.status === 'in_progress' && canAct;
  const messages = sortMessages(history.data?.pages);
  return (
    <section className="ticket-detail" aria-label={`Обращение №${ticket.number}`}>
      <TicketHeader ticket={ticket} onClose={requestClose} />
      <ErrorNotice error={command.error} />
      <div className="detail-grid">
        <div className="conversation-column">
          <ProblemBlock ticket={ticket} timezone={timezone} />
          <Conversation
            ticket={ticket}
            messages={messages}
            history={history}
            timezone={timezone}
            canAct={canAct}
            canSend={canSend}
            onChanged={refresh}
            onError={uploads.setUploadError}
          />
          <Composer
            ticket={ticket}
            draft={draft}
            setDraft={setDraft}
            canSend={canSend}
            pending={command.isPending}
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
          active={active}
          canAct={canAct}
          canSend={canSend}
          pending={command.isPending}
          operate={operate}
          onOpenDialog={setDialog}
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
          pending={command.isPending}
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
