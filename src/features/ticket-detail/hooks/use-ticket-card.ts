import { useCallback, useEffect, useState } from 'react';

import { bindBack } from '@/shared/platform/max-bridge';

import type { TicketDialog } from '../model/dialogs';
import { emptyDraft, isDraftDirty, type Draft } from '../model/draft';

import { useAttachmentUpload } from './use-attachment-upload';
import { useDraft, useDraftGuard } from './use-draft';
import { useRefreshTicket, useTicket } from './use-ticket';
import { useTicketCommand } from './use-ticket-command';
import { useTicketMessages } from './use-ticket-messages';

/**
 * Everything the open ticket's card works with: the ticket and its history, the draft and its
 * uploads, the open dialog, and commands. Collapsing with an unsent draft asks first; the host's
 * Back button collapses too.
 */
export function useTicketCard(id: string, drafts: Map<string, Draft>, onClose: () => void) {
  const detail = useTicket(id);
  const history = useTicketMessages(id);
  const [draft, setDraft] = useDraft(id, drafts);
  const uploads = useAttachmentUpload({
    ticketId: detail.data?.id,
    uploadCount: draft.uploads.length,
    setDraft,
  });
  const [dialog, setDialog] = useState<TicketDialog | null>(null);
  const refresh = useRefreshTicket(id);
  const { command, operate } = useTicketCommand({
    id,
    version: detail.data?.version,
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
  return {
    detail,
    history,
    draft,
    setDraft,
    uploads,
    dialog,
    setDialog,
    refresh,
    command,
    operate,
    requestClose,
  };
}
