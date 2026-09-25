import type { ConnectionState } from '@/shared/api/events-stream';
import { IS_DEMO } from '@/shared/config/env';

import './StatusBanners.scss';

/**
 * Thin strips above the workspace: the demo stand notice, and (on phones, where the header is
 * hidden) the lost connection to the server.
 */
export function StatusBanners({ connection }: { connection: ConnectionState }) {
  return (
    <>
      {IS_DEMO ? (
        <div className="status-banner">Демо-стенд: сообщения в MAX не отправляются</div>
      ) : null}
      {connection === 'reconnecting' ? (
        <p className="status-banner status-banner--offline">
          Нет связи с сервером. Обновляем раз в 15 секунд.
        </p>
      ) : null}
    </>
  );
}
