import { Button, Textarea } from '@maxhub/max-ui';
import type { Dispatch, FormEvent, SetStateAction } from 'react';

import type { useAttachmentUpload } from '@/features/ticket-detail/hooks/use-attachment-upload';
import type { Draft } from '@/features/ticket-detail/model/draft';
import { ACCEPTED_FILES, MAX_REPLY_LENGTH } from '@/features/ticket-detail/model/limits';
import type { Ticket } from '@/shared/types/api';
import { ErrorNotice, Icon } from '@/shared/ui';

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
    return 'Переписка закрыта. Черновик можно скопировать.';
  }
  return 'Ответ доступен назначенному сотруднику. Черновик сохранён.';
}

/** The reply form. Replies go out from the bot's name. */
export function Composer({
  ticket,
  draft,
  setDraft,
  canSend,
  pending,
  uploads,
  onSend,
}: ComposerProps) {
  const { uploading, uploadError, fileRef, upload } = uploads;
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSend();
  };
  const empty = !draft.text.trim() && !draft.uploads.length;
  const scanning = draft.uploads.some((file) => file.status !== 'clean');
  return (
    <form className="composer" onSubmit={submit}>
      <div className="composer__header">
        <strong className="composer__title">Ответ клиенту</strong>
        <span className="composer__sender">
          <span className="composer__online-dot" />
          От имени бота
        </span>
      </div>
      {canSend ? null : <p className="composer__notice">{sendBlockedReason(ticket)}</p>}
      <Textarea
        aria-label="Текст ответа клиенту"
        innerClassNames={{ textarea: 'composer__input' }}
        placeholder={canSend ? 'Напишите ответ клиенту…' : 'Отправка недоступна'}
        value={draft.text}
        onChange={(event) => {
          setDraft((current) => ({ ...current, text: event.target.value }));
        }}
        maxLength={MAX_REPLY_LENGTH}
        rows={4}
        readOnly={!canSend}
        disabled={pending}
      />
      {draft.uploads.length > 0 ? <DraftFiles uploads={draft.uploads} setDraft={setDraft} /> : null}
      <ErrorNotice error={uploadError} />
      <div className="composer__footer">
        <input
          type="file"
          hidden
          ref={fileRef}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void upload(file);
            }
          }}
          accept={ACCEPTED_FILES}
        />
        <button
          type="button"
          className="composer__attach"
          disabled={!canSend || uploading || pending}
          onClick={() => fileRef.current?.click()}
        >
          <Icon name="clip" size={18} />
          {uploading ? 'Проверяем файл…' : 'Прикрепить файл'}
        </button>
        <span className="composer__count">
          {draft.text.length} / {MAX_REPLY_LENGTH}
        </span>
        <Button
          type="submit"
          size="small"
          iconAfter={<Icon name="send" size={16} />}
          loading={pending}
          disabled={!canSend || uploading || empty || scanning}
        >
          Отправить
        </Button>
      </div>
    </form>
  );
}
