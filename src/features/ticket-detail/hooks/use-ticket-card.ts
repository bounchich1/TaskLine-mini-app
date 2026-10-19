import { useCallback, useEffect, useState } from 'react';

import { ApiError } from '@/shared/api/http';
import { bindBack } from '@/shared/platform/max-bridge';

import type { TicketDialog } from '../model/dialogs';
import { draftMessage, emptyDraft, isDraftDirty, noteMessage, type Draft } from '../model/draft';

import { useAttachmentUpload } from './use-attachment-upload';
import { useDraft, useDraftGuard } from './use-draft';
import { useRefreshTicket, useTicket } from './use-ticket';
import { useTicketCommand } from './use-ticket-command';
import { useTicketEffects } from './use-ticket-effects';
import { useTicketMessages } from './use-ticket-messages';
import { useViewing } from './use-viewing';

type TicketCardOptions = { id: string; drafts: Map<string, Draft>; me: string; onClose: () => void };

const SENT = new Set(['messages', 'notes']);

export function useTicketCard({ id, drafts, me, onClose }: TicketCardOptions) {
    const detail = useTicket(id);
    const history = useTicketMessages(id);
    const [draft, setDraft] = useDraft(id, drafts);
    const uploads = useAttachmentUpload({ ticketId: detail.data?.id, uploadCount: draft.uploads.length, setDraft });
    const [dialog, setDialog] = useState<TicketDialog | null>(null);
    const refresh = useRefreshTicket(id);

    const { command, operate } = useTicketCommand({
        id,
        version: detail.data?.version,
        refresh,
        onDone: (action) => {
            setDialog(null);

            if (SENT.has(action)) {
                setDraft(emptyDraft());
            }
        },
    });

    const dirty = isDraftDirty(draft, uploads.uploading);
    const typing = useViewing(detail.data?.id);

    useDraftGuard(id, drafts, draft, dirty);
    useTicketEffects({ id, ticket: detail.data, me, operate });

    const requestClose = useCallback(() => {
        if (dirty) {
            setDialog('discard');
        } else {
            onClose();
        }
    }, [dirty, onClose]);

    useEffect(() => bindBack(requestClose), [requestClose]);

    const error = command.error;
    const collision = error instanceof ApiError && error.code === 'reply_collision' ? error.message : null;

    const send = (confirmed = false) => {
        if (draft.mode === 'note') {
            operate('notes', noteMessage(draft));
        } else {
            operate('messages', { ...draftMessage(draft), ...(confirmed ? { confirm_collision: true } : {}) });
        }
    };

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
        typing,
        collision,
        send,
    };
}
