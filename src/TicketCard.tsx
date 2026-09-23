import { Button, Textarea } from '@maxhub/max-ui';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState, type FormEvent } from 'react';

import { api, ApiError, downloadBrowser } from './api';
import { bindBack, bridge, protectDraft } from './platform';
import type { Attachment, Dictionary, Employee, Message, Session, Ticket } from './types';
import { Badge, date, deliveryNames, ErrorNotice, Icon, learningNames, Modal } from './ui';

type Upload = { id: string; filename: string; status: string };
export type Draft = { text: string; uploads: Upload[] };
export function TicketCard({
  id,
  session,
  employees,
  dictionaries,
  drafts,
  onClose,
}: {
  id: string;
  session: Session;
  employees: Employee[];
  dictionaries: Dictionary[];
  drafts: Map<string, Draft>;
  onClose: () => void;
}) {
  const cache = useQueryClient();
  const detail = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => api<Ticket>(`/v1/tickets/${id}`),
  });
  const history = useInfiniteQuery({
    queryKey: ['messages', id],
    queryFn: ({ pageParam }) =>
      api<{ items: Message[]; has_more: boolean; next_before: number }>(
        `/v1/tickets/${id}/messages${pageParam ? `?before=${pageParam}` : ''}`,
      ),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (p) => (p.has_more ? p.next_before : undefined),
  });
  const [draft, setDraft] = useState<Draft>(() => drafts.get(id) ?? { text: '', uploads: [] });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<unknown>(null);
  const [dialog, setDialog] = useState<'close' | 'transfer' | 'reopen' | 'discard' | null>(null);
  const [reason, setReason] = useState('');
  const [target, setTarget] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const pendingRequest = useRef<{ signature: string; key: string; version: number } | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const ticket = detail.data;
  const dirty = draft.text.length > 0 || draft.uploads.length > 0 || uploading;
  useEffect(() => {
    drafts.set(id, draft);
    protectDraft(dirty);
    const before = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', before);
    return () => {
      window.removeEventListener('beforeunload', before);
      protectDraft(false);
    };
  }, [id, draft, drafts, dirty]);
  useEffect(
    () =>
      bindBack(() => {
        if (dirty) {
          setDialog('discard');
        } else {
          onClose();
        }
      }),
    [dirty, onClose],
  );
  const refresh = async () => {
    await Promise.all([
      cache.invalidateQueries({ queryKey: ['ticket', id] }),
      cache.invalidateQueries({ queryKey: ['messages', id] }),
      cache.invalidateQueries({ queryKey: ['tickets'] }),
    ]);
  };
  const command = useMutation({
    mutationFn: async ({ action, body }: { action: string; body: unknown }) => {
      const signature = JSON.stringify({ id, action, body });
      let request = pendingRequest.current;
      if (!request || request.signature !== signature) {
        request = { signature, key: crypto.randomUUID(), version: ticket!.version };
        pendingRequest.current = request;
      }
      try {
        return await api<Ticket>(`/v1/tickets/${id}/${action}`, {
          method: action === 'classification' ? 'PATCH' : 'POST',
          body,
          key: request.key,
          version: request.version,
        });
      } catch (error) {
        if (error instanceof ApiError && error.status !== 0 && error.status !== 503) {
          pendingRequest.current = null;
        }
        throw error;
      }
    },
    onSuccess: async (_result, variables) => {
      pendingRequest.current = null;
      setDialog(null);
      setReason('');
      if (variables.action === 'messages') {
        setDraft({ text: '', uploads: [] });
      }
      await refresh();
    },
    onError: () => {
      void refresh();
    },
  });
  const operate = (action: string, body: unknown = {}) => command.mutate({ action, body });
  async function upload(file: File) {
    setUploading(true);
    setUploadError(null);
    let id: string | undefined;
    try {
      if (draft.uploads.length >= 10) {
        throw new Error('К сообщению можно прикрепить не больше 10 файлов.');
      }
      const kind = file.type.startsWith('image/')
        ? 'image'
        : file.type.startsWith('video/')
          ? 'video'
          : 'file';
      const limit = (kind === 'video' ? 100 : kind === 'image' ? 20 : 25) * 1024 * 1024;
      if (file.size > limit) {
        throw new Error(`Файл слишком большой. Максимум ${limit / 1024 / 1024} МБ.`);
      }
      const prepared = await api<{ id: string }>('/v1/uploads', {
        method: 'POST',
        body: { ticket_id: ticket!.id, filename: file.name, kind },
      });
      id = prepared.id;
      const form = new FormData();
      form.append('file', file);
      await api(`/v1/uploads/${id}/content`, { method: 'PUT', body: form });
      let value: Upload = { id, filename: file.name, status: 'quarantined' };
      setDraft((d) => ({ ...d, uploads: [...d.uploads, value] }));
      for (let i = 0; i < 60 && mounted.current; i++) {
        value = await api<Upload>(`/v1/uploads/${id}/complete`, { method: 'POST', body: {} });
        setDraft((d) => ({ ...d, uploads: d.uploads.map((u) => (u.id === id ? value : u)) }));
        if (value.status === 'clean') {
          return;
        }
        if (['infected', 'rejected', 'failed', 'canceled'].includes(value.status)) {
          throw new Error('Файл не прошёл проверку. Удалите его из черновика и выберите другой.');
        }
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
      if (mounted.current) {
        throw new Error(
          'Проверка файла ещё не завершена. Сохраните черновик и проверьте статус позже.',
        );
      }
    } catch (error) {
      if (mounted.current) {
        setUploadError(error);
      }
    } finally {
      if (mounted.current) {
        setUploading(false);
      }
      if (fileRef.current) {
        fileRef.current.value = '';
      }
    }
  }
  if (detail.isPending) {
    return <div className="ticket-detail loading">Загружаем переписку…</div>;
  }
  if (!ticket) {
    return (
      <div className="ticket-detail">
        <ErrorNotice error={detail.error} />
        <Button variant="secondary" onClick={() => void detail.refetch()}>
          Повторить
        </Button>
      </div>
    );
  }
  const active = ['open', 'in_progress'].includes(ticket.status);
  const canAct = ticket.assignee_id === session.employee.id || session.capabilities.act_on_others;
  const canSend = ticket.status === 'in_progress' && canAct;
  const messages = history.data?.pages.flatMap((p) => p.items).sort((a, b) => a.seq - b.seq) ?? [];
  const unresolved = messages.some(
    (m) =>
      m.author_type === 'staff' &&
      ['queued', 'sending', 'retry_wait', 'unknown'].includes(m.delivery_state),
  );
  const closeCard = () => {
    if (dirty) {
      setDialog('discard');
    } else {
      onClose();
    }
  };
  function submit(event: FormEvent) {
    event.preventDefault();
    operate('messages', { text: draft.text, attachment_ids: draft.uploads.map((u) => u.id) });
  }
  return (
    <section className="ticket-detail" aria-label={`Обращение №${ticket.number}`}>
      <div className="detail-heading">
        <div>
          <span className="eyebrow">КАРТОЧКА ОБРАЩЕНИЯ</span>
          <h2>
            №{ticket.number}
            <Badge status={ticket.status} />
          </h2>
        </div>
        <button className="icon-button" aria-label="Свернуть обращение" onClick={closeCard}>
          <Icon name="close" />
        </button>
      </div>
      <ErrorNotice error={command.error} />
      <div className="detail-grid">
        <div className="conversation-column">
          <div className="problem">
            <span className="section-label">ПРОБЛЕМА КЛИЕНТА</span>
            <p>{ticket.description}</p>
            <div className="meta-line">
              <Icon name="clock" size={14} />
              Создано {date(ticket.created_at, session.organization.timezone)}
              {ticket.taken_at && (
                <> · Взято {date(ticket.taken_at, session.organization.timezone)}</>
              )}
            </div>
          </div>
          <div className="conversation-header">
            <h3>Переписка</h3>
            <span>{messages.length} сообщений загружено</span>
          </div>
          <ErrorNotice error={history.error} />
          <div className="conversation" aria-label="История переписки">
            {history.hasNextPage && (
              <Button
                variant="ghost"
                size="small"
                loading={history.isFetchingNextPage}
                onClick={() => void history.fetchNextPage()}
              >
                Загрузить ранние сообщения
              </Button>
            )}
            {messages.map((message) => (
              <div key={message.id} className={`message message-${message.author_type}`}>
                <div className="message-meta">
                  <strong>
                    {message.author_type === 'client'
                      ? 'Клиент'
                      : message.author_type === 'staff'
                        ? (message.author_name ?? 'Сотрудник')
                        : message.author_type === 'bot'
                          ? 'Бот поддержки'
                          : 'Системная запись'}
                  </strong>
                  <time dateTime={message.created_at}>
                    {date(message.created_at, session.organization.timezone)}
                  </time>
                  {message.revision > 1 && <span>изменено</span>}
                </div>
                <div className="message-body">
                  {message.deleted ? <em>Сообщение удалено клиентом</em> : message.text}
                  {ticket.attachments
                    ?.filter((a) => a.message_id === message.id)
                    .map((file) => (
                      <AttachmentItem file={file} key={file.id} />
                    ))}
                </div>
                {message.author_type === 'staff' && (
                  <div className={`delivery delivery-${message.delivery_state}`}>
                    <Icon
                      name={message.delivery_state === 'delivered' ? 'check' : 'clock'}
                      size={12}
                    />
                    {deliveryNames[message.delivery_state] ?? message.delivery_state}
                    {canAct &&
                      ['queued', 'retry_wait', 'failed'].includes(message.delivery_state) && (
                        <button
                          className="text-button"
                          onClick={() =>
                            void api(`/v1/messages/${message.id}/cancel`, {
                              method: 'POST',
                              body: {},
                            })
                              .then(refresh)
                              .catch(setUploadError)
                          }
                        >
                          Отменить
                        </button>
                      )}
                    {canAct && canSend && message.delivery_state === 'failed' && (
                      <button
                        className="text-button"
                        onClick={() =>
                          void api(`/v1/messages/${message.id}/retry`, { method: 'POST', body: {} })
                            .then(refresh)
                            .catch(setUploadError)
                        }
                      >
                        Повторить
                      </button>
                    )}
                    {message.delivery_state === 'unknown' && (
                      <span> · Требуется проверка руководителя</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          <form className="composer" onSubmit={submit}>
            <div className="composer-label">
              <strong>Ответ клиенту</strong>
              <span>
                <span className="online-dot" />
                От имени бота
              </span>
            </div>
            {!canSend && (
              <p className="composer-disabled">
                {ticket.status === 'open'
                  ? 'Возьмите обращение в работу, чтобы ответить.'
                  : !active
                    ? 'Переписка закрыта. Черновик можно скопировать.'
                    : 'Ответ доступен назначенному сотруднику. Черновик сохранён.'}
              </p>
            )}
            <Textarea
              aria-label="Текст ответа клиенту"
              placeholder={canSend ? 'Напишите ответ клиенту…' : 'Отправка недоступна'}
              value={draft.text}
              onChange={(e) => setDraft((d) => ({ ...d, text: e.target.value }))}
              maxLength={4000}
              rows={4}
              readOnly={!canSend}
              disabled={command.isPending}
            />
            {draft.uploads.length > 0 && (
              <div className="draft-files">
                {draft.uploads.map((file) => (
                  <span key={file.id}>
                    <Icon name="clip" size={14} />
                    {file.filename}
                    <small>{file.status === 'clean' ? 'Готов к отправке' : 'Проверка файла'}</small>
                    <button
                      type="button"
                      aria-label={`Убрать ${file.filename}`}
                      onClick={() => {
                        void api(`/v1/uploads/${file.id}`, { method: 'DELETE' }).catch(() => {});
                        setDraft((d) => ({
                          ...d,
                          uploads: d.uploads.filter((u) => u.id !== file.id),
                        }));
                      }}
                    >
                      <Icon name="close" size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <ErrorNotice error={uploadError} />
            <div className="composer-footer">
              <input
                type="file"
                hidden
                ref={fileRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    void upload(file);
                  }
                }}
                accept="image/*,video/*,.pdf,.txt,.doc,.docx,.xls,.xlsx"
              />
              <button
                type="button"
                className="attach-button"
                disabled={!canSend || uploading || command.isPending}
                onClick={() => fileRef.current?.click()}
              >
                <Icon name="clip" size={18} />
                {uploading ? 'Проверяем файл…' : 'Прикрепить файл'}
              </button>
              <span className="char-count">{draft.text.length} / 4000</span>
              <Button
                type="submit"
                size="small"
                iconAfter={<Icon name="send" size={16} />}
                loading={command.isPending}
                disabled={
                  !canSend ||
                  uploading ||
                  (!draft.text.trim() && !draft.uploads.length) ||
                  draft.uploads.some((u) => u.status !== 'clean')
                }
              >
                Отправить
              </Button>
            </div>
          </form>
        </div>
        <aside className="ticket-properties">
          <div className="property-box">
            <span className="section-label">ДЕТАЛИ И ДЕЙСТВИЯ</span>
            <div className="assigned-to">
              <span className="avatar-small">
                <Icon name="user" size={16} />
              </span>
              <div>
                <small>Исполнитель</small>
                <strong>{ticket.assignee_name ?? 'Не назначен'}</strong>
              </div>
            </div>
            {(['tag', 'urgency', 'complexity'] as const).map((field) => (
              <label className="property" key={field}>
                {field === 'tag' ? 'Тег' : field === 'urgency' ? 'Срочность' : 'Сложность'}
                <select
                  aria-label={`Изменить ${field === 'tag' ? 'тег' : field === 'urgency' ? 'срочность' : 'сложность'}`}
                  disabled={!active || command.isPending}
                  value={ticket[field]}
                  onChange={(event) =>
                    operate('classification', {
                      [field]: event.target.value,
                      revisions: { [field]: ticket[`${field}_revision`] },
                    })
                  }
                >
                  {dictionaries
                    .filter((d) => d.dimension === field && (d.active || d.code === ticket[field]))
                    .map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.label}
                        {!d.active ? ' (архив)' : ''}
                      </option>
                    ))}
                </select>
              </label>
            ))}
            <div className="ticket-actions">
              {ticket.status === 'open' && (
                <Button size="small" loading={command.isPending} onClick={() => operate('assign')}>
                  Взять в работу
                </Button>
              )}
              {ticket.status === 'in_progress' && canAct && (
                <>
                  <Button
                    variant="secondary"
                    size="small"
                    disabled={command.isPending}
                    onClick={() => {
                      setDialog('transfer');
                      setTarget('');
                      setReason('');
                    }}
                  >
                    Передать сотруднику
                  </Button>
                  <Button
                    variant="primary"
                    size="small"
                    disabled={command.isPending}
                    onClick={() => {
                      setDialog('close');
                      setReason('');
                    }}
                    iconBefore={<Icon name="check" size={16} />}
                  >
                    Закрыть обращение
                  </Button>
                </>
              )}
              {!active && canAct && (
                <Button
                  variant="secondary"
                  size="small"
                  disabled={command.isPending}
                  onClick={() => {
                    setDialog('reopen');
                    setReason('');
                  }}
                >
                  Переоткрыть
                </Button>
              )}
            </div>
          </div>
          <div className="ai-panel">
            <div className="ai-title">
              <span>
                <Icon name="spark" size={18} />
                Помощник
              </span>
              <span className="private-label">Только команде</span>
            </div>
            {ticket.ai_status === 'pending' ? (
              <p>Изучает первое сообщение. Можно отвечать, не дожидаясь подсказки.</p>
            ) : ticket.suggestion_stale ? (
              <p>Подсказка устарела после изменения обращения. Проверьте актуальную переписку.</p>
            ) : ticket.suggestion?.suggested_solution ? (
              <>
                <p className="suggestion">{ticket.suggestion.suggested_solution}</p>
                {ticket.suggestion.missing_information.length > 0 && (
                  <div className="missing-info">
                    <strong>Что уточнить</strong>
                    <ul>
                      {ticket.suggestion.missing_information.map((v) => (
                        <li key={v}>{v}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <Button
                  variant="secondary"
                  size="small"
                  stretched
                  disabled={!canSend || command.isPending}
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      text: [d.text, ticket.suggestion!.suggested_solution]
                        .filter(Boolean)
                        .join('\n\n')
                        .slice(0, 4000),
                    }))
                  }
                >
                  Вставить в черновик
                </Button>
                <small>
                  Проверьте перед отправкой
                  {ticket.suggestion.evidence_memory_ids.length
                    ? ` · Источников: ${ticket.suggestion.evidence_memory_ids.length}`
                    : ''}
                </small>
              </>
            ) : (
              <>
                <p>
                  {ticket.ai_status === 'failed'
                    ? 'Автоматическая классификация недоступна. Проверьте параметры вручную.'
                    : 'Недостаточно данных для надёжной подсказки.'}
                </p>
                <span className="manual-label">Нужна проверка сотрудником</span>
              </>
            )}
          </div>
          {(ticket.closures?.length ?? 0) > 0 && (
            <div className="property-box">
              <span className="section-label">ОЦЕНКИ И ОБУЧЕНИЕ</span>
              {ticket.closures!.map((cycle) => (
                <div className="closure" key={cycle.id}>
                  <div>
                    <strong>
                      {cycle.rating
                        ? `${cycle.rating} / 10`
                        : cycle.finished_reason
                          ? 'Без оценки'
                          : cycle.invalidated
                            ? 'Переоткрыто'
                            : 'Ожидаем оценку'}
                    </strong>
                    <small>
                      Закрытие {cycle.cycle_no} ·{' '}
                      {date(cycle.closed_at, session.organization.timezone, true)}
                    </small>
                  </div>
                  <p>
                    <Icon name="spark" size={13} />
                    {learningNames[cycle.learning_status] ?? cycle.learning_status}
                  </p>
                  {cycle.coverage && (
                    <small>
                      {cycle.coverage.message_count ?? 0} сообщений ·{' '}
                      {cycle.coverage.missing_attachments?.length
                        ? `${cycle.coverage.missing_attachments.length} вложений без полного анализа`
                        : 'Текстовая история учтена'}
                    </small>
                  )}
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
      {dialog && (
        <Modal
          title={
            dialog === 'close'
              ? 'Закрыть обращение?'
              : dialog === 'transfer'
                ? 'Передать обращение'
                : dialog === 'reopen'
                  ? 'Переоткрыть обращение'
                  : 'Свернуть черновик?'
          }
          onClose={() => setDialog(null)}
          busy={command.isPending}
          footer={
            dialog === 'discard' ? (
              <Button
                onClick={() => {
                  setDialog(null);
                  onClose();
                }}
              >
                Сохранить и свернуть
              </Button>
            ) : (
              <Button
                loading={command.isPending}
                disabled={
                  (dialog === 'close' && unresolved) ||
                  (dialog === 'transfer' && (!target || !reason.trim())) ||
                  (dialog === 'reopen' && !reason.trim())
                }
                onClick={() => {
                  if (dialog === 'close') {
                    operate('close', { note: reason });
                  }
                  if (dialog === 'transfer') {
                    operate('transfer', { employee_id: target, comment: reason });
                  }
                  if (dialog === 'reopen') {
                    operate('reopen', { reason });
                  }
                }}
              >
                {dialog === 'close'
                  ? 'Закрыть'
                  : dialog === 'transfer'
                    ? 'Передать'
                    : 'Переоткрыть'}
              </Button>
            )
          }
        >
          <ErrorNotice error={command.error} />
          {dialog === 'close' ? (
            <>
              <p>
                Обращение №{ticket.number} перейдёт в «Ожидает оценки». Клиент получит просьбу
                оценить работу поддержки. Переписка будет сохранена для анализа.
              </p>
              {unresolved && (
                <div className="error-notice">
                  Есть неподтверждённые отправки. Дождитесь доставки или отмените их.
                </div>
              )}
              <label className="form-field">
                Внутренний итог (необязательно)
                <textarea
                  maxLength={2000}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </label>
            </>
          ) : dialog === 'transfer' ? (
            <>
              <label className="form-field">
                Новый исполнитель
                <select value={target} onChange={(e) => setTarget(e.target.value)}>
                  <option value="">Выберите сотрудника</option>
                  {employees
                    .filter((e) => !e.blocked && e.id !== ticket.assignee_id)
                    .map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                </select>
              </label>
              <label className="form-field">
                Комментарий к передаче
                <textarea
                  required
                  maxLength={2000}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </label>
            </>
          ) : dialog === 'reopen' ? (
            <>
              <p>Клиент сможет продолжить переписку. Предыдущие оценки останутся в истории.</p>
              <label className="form-field">
                Причина
                <textarea
                  required
                  maxLength={2000}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </label>
            </>
          ) : (
            <p>Черновик останется в этом окне. После закрытия приложения он будет утрачен.</p>
          )}
        </Modal>
      )}
    </section>
  );
}
function AttachmentItem({ file }: { file: Attachment }) {
  const [grant, setGrant] = useState<{ url: string; filename: string; expires_at: string } | null>(
    null,
  );
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const native = bridge()?.platform !== 'web' && !!bridge()?.downloadFile;
  const download = () => {
    setError(null);
    if (native && grant && new Date(grant.expires_at).getTime() > Date.now()) {
      try {
        void Promise.resolve(bridge()!.downloadFile!(grant.url, grant.filename)).catch(setError);
      } catch (error) {
        setError(error);
      }
      return;
    }
    setBusy(true);
    void (
      native
        ? api<{ url: string; filename: string; expires_at: string }>(
            `/v1/attachments/${file.id}/download-grant`,
            { method: 'POST', body: {} },
          ).then(setGrant)
        : downloadBrowser(file.id, file.filename)
    )
      .catch(setError)
      .finally(() => setBusy(false));
  };
  return (
    <div className="attachment">
      <Icon name="clip" size={17} />
      <div>
        <strong>{file.filename}</strong>
        <small>
          {file.status === 'clean'
            ? `${Math.max(1, Math.round(Number(file.bytes) / 1024))} КБ`
            : ({
                pending: 'Загружается',
                quarantined: 'На проверке',
                infected: 'Файл заблокирован',
                rejected: 'Неподдерживаемый формат',
                unavailable: 'Файл недоступен',
              }[file.status] ?? 'Не готов')}
        </small>
        <ErrorNotice error={error} />
      </div>
      {file.status === 'clean' && (
        <button className="text-button" disabled={busy} onClick={download}>
          {busy ? '…' : native && !grant ? 'Подготовить' : 'Скачать'}
          <Icon name="download" size={14} />
        </button>
      )}
    </div>
  );
}
