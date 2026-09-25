import { AdminCard } from '@/features/admin/components/AdminCard/AdminCard';
import type {
  Diagnostics,
  DiagnosticKind,
  Resolution,
  ServerHealth,
} from '@/features/admin/model/types';
import { APP_VERSION } from '@/shared/config/env';
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
  server: ServerHealth | undefined;
  busy: boolean;
  onTicket: (id: string) => void;
  onResolve: (resolution: Resolution) => void;
  onRetryJob: (id: string) => void;
};

export function DiagnosticsTab({ diagnostics, server, ...rowProps }: DiagnosticsTabProps) {
  return (
    <>
      <AdminCard title="Вызовы ИИ">
        <div className="permit-grid">
          {diagnostics?.permits.map((permit) => (
            <div
              className={`permit-grid__slot permit-grid__slot--${permit.state}`}
              key={permit.slot}
            >
              <span className="permit-grid__number">{permit.slot}</span>
              <span className="permit-grid__state">{permitLabel(permit.state)}</span>
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
            <div className="admin-card__list">
              {diagnostics[kind].map((item) => (
                <DiagnosticRow key={item.id} kind={kind} item={item} {...rowProps} />
              ))}
            </div>
          ) : (
            <p className="admin-card__help">Нет записей.</p>
          )}
        </AdminCard>
      ))}
      <AdminCard title="Версия">
        <p className="admin-card__help">
          Приложение {APP_VERSION} · сервер {server?.version ?? '—'}
        </p>
      </AdminCard>
    </>
  );
}
