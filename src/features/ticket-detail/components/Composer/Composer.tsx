import { Button } from '@maxhub/max-ui';
import { clsx } from 'clsx';
import type { Dispatch, FormEvent, KeyboardEvent, SetStateAction } from 'react';

import type { useAttachmentUpload } from '@/features/ticket-detail/hooks/use-attachment-upload';
import { canSubmitDraft, isDraftDirty, type Draft } from '@/features/ticket-detail/model/draft';
import { MAX_REPLY_LENGTH } from '@/features/ticket-detail/model/limits';
import type { Ticket } from '@/shared/types/api';
import { ErrorNotice, Icon } from '@/shared/ui';

import { AttachButton } from '../AttachButton/AttachButton';
import { DraftFiles } from '../DraftFiles/DraftFiles';

import './Composer.scss';

type ComposerProps = {
  ticket: Ticket;
  draft: Draft;
  setDraft: Dispatch<SetStateAction<Draft>>;
  canSend: boolean;
  /** A command is in flight. */
  pending: boolean;
  uploads: ReturnType<typeof useAttachmentUpload>;
  onSend: () => void;
};

function sendBlockedReason(ticket: Ticket) {
  if (ticket.status === 'open') {
    return 'Возьмите обращение в работу, чтобы ответить.';
  }
  if (!['open', 'in_progress'].includes(ticket.status)) {
    return 'Обращение закрыто, ответить нельзя.';
  }
  return 'Отвечает назначенный сотрудник.';
}

/** The reply form, pinned under the history. Replies go out from the bot's name. */
export function Composer({
  ticket,
  draft,
  setDraft,
  canSend,
  pending,
  uploads,
  onSend,
}: ComposerProps) {
  const sendable = canSend && canSubmitDraft(draft, uploads.uploading || pending);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (sendable) {
      onSend();
    }
  };
  const shortcut = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      submit(event);
    }
  };
  // Nothing to send or copy: the reason alone.
  if (!canSend && !isDraftDirty(draft, false)) {
    return (
      <div className="composer">
        <p className="composer__notice">{sendBlockedReason(ticket)}</p>
      </div>
    );
  }
  return (
    <form className="composer" onSubmit={submit}>
      {canSend ? null : (
        <p className="composer__notice">
          {sendBlockedReason(ticket)} Черновик сохранён, его можно скопировать.
        </p>
      )}
      <div className={clsx('composer__box', !canSend && 'composer__box--locked')}>
        {draft.uploads.length > 0 ? (
          <DraftFiles uploads={draft.uploads} setDraft={setDraft} />
        ) : null}
        <textarea
          className="composer__input"
          aria-label="Текст ответа клиенту"
          placeholder={canSend ? 'Ответ клиенту от имени бота' : 'Отправка недоступна'}
          value={draft.text}
          onChange={(event) => {
            setDraft((current) => ({ ...current, text: event.target.value }));
          }}
          onKeyDown={shortcut}
          maxLength={MAX_REPLY_LENGTH}
          rows={3}
          readOnly={!canSend}
          disabled={pending}
        />
        <div className="composer__bar">
          <AttachButton uploads={uploads} disabled={!canSend || pending} />
          {draft.text.length > 0 ? (
            <span className="composer__count">
              {draft.text.length} / {MAX_REPLY_LENGTH}
            </span>
          ) : null}
          <Button
            type="submit"
            size="xsmall"
            title="Ctrl+Enter"
            iconAfter={<Icon name="send" size={15} />}
            loading={pending}
            disabled={!sendable && !pending}
          >
            Отправить
          </Button>
        </div>
      </div>
      <ErrorNotice className="composer__error" error={uploads.uploadError} />
    </form>
  );
}
