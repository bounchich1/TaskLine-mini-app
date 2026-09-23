import { AdminCard } from '@/features/admin/components/AdminCard/AdminCard';
import type { Diagnostics, DiagnosticKind, Resolution } from '@/features/admin/model/types';
import { permitLabel } from '@/shared/config/labels';

import { DiagnosticRow } from '../DiagnosticRow/DiagnosticRow';

import './DiagnosticsTab.scss';

const SECTIONS: readonly (readonly [DiagnosticKind, string])[] = [
  ['deliveries', 'Незавершённые отправки'],
  ['jobs', 'Фоновые задачи'],
  ['memory', 'Память решений'],
];

type DiagnosticsTabProps = {
  diagnostics: Diagnostics | undefined;
  busy: boolean;
  onTicket: (id: string) => void;
  onResolve: (resolution: Resolution) => void;
  onRetryJob: (id: string) => void;
};

/** AI call slots, and deliveries, jobs and memory writes that did not finish normally. */
export function DiagnosticsTab({ diagnostics, ...rowProps }: DiagnosticsTabProps) {
  return (
    <>
      <AdminCard title="Вызовы ИИ">
        <div className="permit-grid">
          {diagnostics?.permits.map((permit) => (
            <div
              className={`permit-grid__slot permit-grid__slot--${permit.state}`}
              key={permit.slot}
            >
              <strong className="permit-grid__number">{permit.slot}</strong>
              <small className="permit-grid__state">{permitLabel(permit.state)}</small>
            </div>
          ))}
        </div>
        <p className="admin-card__help">
          Неопределённый вызов удерживает место до подтверждения завершения.
        </p>
      </AdminCard>
      {SECTIONS.map(([kind, title]) => (
        <AdminCard title={title} key={kind}>
          {diagnostics?.[kind].length ? (
            diagnostics[kind].map((item) => (
              <DiagnosticRow key={item.id} kind={kind} item={item} {...rowProps} />
            ))
          ) : (
            <p className="admin-card__help">Нет записей.</p>
          )}
        </AdminCard>
      ))}
    </>
  );
}
