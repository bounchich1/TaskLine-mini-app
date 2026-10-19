import { clsx } from 'clsx';
import type { Dispatch, FormEvent, RefObject, SetStateAction } from 'react';

import type { useAttachmentUpload } from '@/features/ticket-detail/hooks/use-attachment-upload';
import { useComposerSuggest } from '@/features/ticket-detail/hooks/use-composer-suggest';
import { canSubmitDraft, emptyDraft, isDraftDirty, type Draft } from '@/features/ticket-detail/model/draft';
import type { Employee, Ticket } from '@/shared/types/api';
import type { Macro } from '@/shared/types/routing';
import { ErrorNotice } from '@/shared/ui';

import { ComposerBar } from '../ComposerBar/ComposerBar';
import { ComposerInput } from '../ComposerInput/ComposerInput';
import { ComposerModes } from '../ComposerModes/ComposerModes';
import { DraftFiles } from '../DraftFiles/DraftFiles';

import './Composer.scss';

type ComposerProps = {
    ticket: Ticket;
    draft: Draft;
    setDraft: Dispatch<SetStateAction<Draft>>;
    inputRef: RefObject<HTMLTextAreaElement | null>;
    canSend: boolean;
    canNote: boolean;
    pending: boolean;
    uploads: ReturnType<typeof useAttachmentUpload>;
    employees: Employee[];
    macros: Macro[];
    macroContext: { ticketNumber: string; agentName: string; eta: string };
    me: string;
    onTyping: () => void;
    onSend: () => void;
};

const switchMode = (mode: Draft['mode']) => (current: Draft) =>
    current.text || current.uploads.length ? { ...current, mode } : emptyDraft(mode);

function sendBlockedReason(ticket: Ticket) {
    if (ticket.status === 'open') {
        return 'Возьмите обращение в работу, чтобы ответить.';
    }

    if (!['open', 'in_progress'].includes(ticket.status)) {
        return 'Обращение закрыто, ответить нельзя.';
    }

    return 'Отвечает назначенный сотрудник.';
}

function composerState({ draft, canSend, canNote, pending, uploads }: ComposerProps) {
    const note = draft.mode === 'note';
    const allowed = note ? canNote : canSend;

    return {
        note,
        allowed,
        sendable: allowed && canSubmitDraft(draft, uploads.uploading || pending),
        idle: !canSend && !canNote && !isDraftDirty(draft, false),
        boxClass: clsx('composer__box', !allowed && 'composer__box--locked', note && 'composer__box--note'),
    };
}

export function Composer(props: ComposerProps) {
    const { ticket, draft, setDraft, canSend, canNote, pending, uploads } = props;
    const { note, allowed, sendable, idle, boxClass } = composerState(props);
    const suggest = useComposerSuggest({ ...props, draft, setDraft });

    const submit = (event?: FormEvent) => {
        event?.preventDefault();

        if (sendable) {
            props.onSend();
        }
    };

    if (idle) {
        return (
            <div className="composer">
                <p className="composer__notice">{sendBlockedReason(ticket)}</p>
            </div>
        );
    }

    return (
        <form className="composer" onSubmit={submit}>
            {canNote ? (
                <ComposerModes
                    mode={draft.mode}
                    onMode={(mode) => {
                        setDraft(switchMode(mode));
                        props.inputRef.current?.focus();
                    }}
                />
            ) : null}

            {allowed ? null : <p className="composer__notice">{sendBlockedReason(ticket)} Черновик сохранён.</p>}

            <div className={boxClass}>
                {!note && draft.uploads.length > 0 ? <DraftFiles uploads={draft.uploads} setDraft={setDraft} /> : null}

                <ComposerInput
                    inputRef={props.inputRef}
                    draft={draft}
                    setDraft={setDraft}
                    suggest={suggest}
                    locked={!allowed}
                    pending={pending}
                    onTyping={props.onTyping}
                    onSubmit={submit}
                />

                <ComposerBar
                    note={note}
                    length={draft.text.length}
                    uploads={uploads}
                    attachDisabled={!canSend || pending}
                    pending={pending}
                    sendable={sendable}
                />
            </div>

            <ErrorNotice className="composer__error" error={uploads.uploadError} />
        </form>
    );
}
