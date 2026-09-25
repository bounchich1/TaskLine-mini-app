import type { ConnectionState } from '@/shared/api/events-stream';
import { IS_DEMO } from '@/shared/config/env';

import './StatusBanners.scss';

export function StatusBanners({ connection }: { connection: ConnectionState }) {
    return (
        <>
            {IS_DEMO ? <div className="status-banner">Демо-стенд: сообщения в MAX не отправляются</div> : null}

            {connection === 'reconnecting' ? (
                <p className="status-banner status-banner--offline">Нет связи с сервером. Обновляем раз в 15 секунд.</p>
            ) : null}
        </>
    );
}
