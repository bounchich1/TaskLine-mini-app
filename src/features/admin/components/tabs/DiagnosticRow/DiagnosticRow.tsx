import { Button } from '@maxhub/max-ui';

import { AdminRow } from '@/features/admin/components/AdminRow/AdminRow';
import type { Diagnostic, DiagnosticKind, Resolution } from '@/features/admin/model/types';
import { diagnosticReasonLabel } from '@/shared/config/labels';
import { Icon } from '@/shared/ui';

import { ResolveButtons } from '../ResolveButtons/ResolveButtons';

const RETRYABLE_JOBS = ['file', 'scan', 'memory_delete', 'message_revision'];
const FINISHED_STATES = ['done', 'failed', 'canceled'];

type DiagnosticRowProps = {
    kind: DiagnosticKind;
    item: Diagnostic;
    busy: boolean;
    onTicket: (id: string) => void;
    onResolve?: (resolution: Resolution) => void;
    onRetryJob?: (id: string) => void;
};

const isUncertainDelivery = (kind: DiagnosticKind, item: Diagnostic) =>
    kind === 'deliveries' && !!item.message_id && item.state === 'unknown';

const isRetryableJob = (kind: DiagnosticKind, item: Diagnostic) =>
    kind === 'jobs' && item.state === 'failed' && RETRYABLE_JOBS.includes(item.kind ?? '');

function diagnosticDetail(item: Diagnostic): string | null {
    if (item.reason) {
        return diagnosticReasonLabel(item.reason);
    }

    return FINISHED_STATES.includes(item.state) ? null : 'Обрабатывается по расписанию';
}

export function DiagnosticRow({ kind, item, busy, onTicket, onResolve, onRetryJob }: DiagnosticRowProps) {
    const ticketId = item.ticket_id;
    const uncertainDelivery = isUncertainDelivery(kind, item);
    const retryableJob = isRetryableJob(kind, item);
    const detail = diagnosticDetail(item);

    return (
        <AdminRow wrap>
            <div className="admin-row__main">
                <strong className="admin-row__title">
                    {item.kind ?? 'Запись памяти'} · {item.state}
                </strong>

                {detail ? <small className="admin-row__meta">{detail}</small> : null}
            </div>

            {ticketId ? (
                <button
                    className="admin-row__link"
                    onClick={() => {
                        onTicket(ticketId);
                    }}
                >
                    Обращение
                    <Icon name="arrow" size={14} />
                </button>
            ) : null}

            {uncertainDelivery && onResolve ? <ResolveButtons item={item} onResolve={onResolve} /> : null}

            {retryableJob && onRetryJob ? (
                <Button
                    variant="secondary"
                    size="xsmall"
                    disabled={busy}
                    onClick={() => {
                        onRetryJob(item.id);
                    }}
                >
                    Повторить
                </Button>
            ) : null}
        </AdminRow>
    );
}
