import { Button } from '@maxhub/max-ui';

import type { Diagnostic, DiagnosticKind, Resolution } from '@/features/admin/model/types';
import { Icon } from '@/shared/ui';

/** Failed jobs of these kinds can be retried from the admin panel. */
const RETRYABLE_JOBS = ['file', 'scan', 'memory_delete', 'message_revision'];

type DiagnosticRowProps = {
  kind: DiagnosticKind;
  item: Diagnostic;
  busy: boolean;
  onTicket: (id: string) => void;
  onResolve: (resolution: Resolution) => void;
  onRetryJob: (id: string) => void;
};

/** One unfinished item, with the actions an operator can take on it. */
export function DiagnosticRow({
  kind,
  item,
  busy,
  onTicket,
  onResolve,
  onRetryJob,
}: DiagnosticRowProps) {
  const ticketId = item.ticket_id;
  const uncertainDelivery = kind === 'deliveries' && !!item.message_id && item.state === 'unknown';
  const retryableJob =
    kind === 'jobs' && item.state === 'failed' && RETRYABLE_JOBS.includes(item.kind ?? '');
  return (
    <div className="admin-row diagnostic">
      <div>
        <strong>
          {item.kind ?? 'Запись памяти'} · {item.state}
        </strong>
        <small>{item.reason ?? 'Обрабатывается по расписанию'}</small>
      </div>
      {ticketId ? (
        <button
          className="text-button"
          onClick={() => {
            onTicket(ticketId);
          }}
        >
          Обращение
          <Icon name="arrow" size={14} />
        </button>
      ) : null}
      {uncertainDelivery ? (
        <>
          <Button
            size="small"
            variant="secondary"
            onClick={() => {
              onResolve({ item, action: 'cancel' });
            }}
          >
            Не повторять
          </Button>
          <Button
            size="small"
            variant="secondary"
            onClick={() => {
              onResolve({ item, action: 'retry' });
            }}
          >
            Повторить
          </Button>
        </>
      ) : null}
      {retryableJob ? (
        <Button
          variant="secondary"
          size="small"
          disabled={busy}
          onClick={() => {
            onRetryJob(item.id);
          }}
        >
          Повторить
        </Button>
      ) : null}
    </div>
  );
}
