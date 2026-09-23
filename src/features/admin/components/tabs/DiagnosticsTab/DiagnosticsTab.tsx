import type { Diagnostics, DiagnosticKind, Resolution } from '@/features/admin/model/types';
import { permitLabel } from '@/shared/config/labels';

import { DiagnosticRow } from '../DiagnosticRow/DiagnosticRow';

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
      <section className="admin-card">
        <h2>Вызовы ИИ</h2>
        <div className="permit-grid">
          {diagnostics?.permits.map((permit) => (
            <div className={`permit permit-${permit.state}`} key={permit.slot}>
              <strong>{permit.slot}</strong>
              <small>{permitLabel(permit.state)}</small>
            </div>
          ))}
        </div>
        <p className="admin-help">
          Неопределённый вызов удерживает место до подтверждения завершения.
        </p>
      </section>
      {SECTIONS.map(([kind, title]) => (
        <section className="admin-card" key={kind}>
          <h2>{title}</h2>
          {diagnostics?.[kind].length ? (
            diagnostics[kind].map((item) => (
              <DiagnosticRow key={item.id} kind={kind} item={item} {...rowProps} />
            ))
          ) : (
            <p className="admin-help">Нет записей.</p>
          )}
        </section>
      ))}
    </>
  );
}
