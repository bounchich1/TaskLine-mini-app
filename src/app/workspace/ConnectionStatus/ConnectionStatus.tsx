import { clsx } from 'clsx';

import type { ConnectionState } from '@/shared/api/events-stream';

import './ConnectionStatus.scss';

type ConnectionStatusProps = { connection: ConnectionState; className?: string; detailed?: boolean };

const LIVE = 'Обновляется в реальном времени';

export function ConnectionStatus({ connection, className, detailed = false }: ConnectionStatusProps) {
    const live = detailed ? LIVE : 'В сети';

    return (
        <span
            className={clsx('connection-status', `connection-status--${connection}`, className)}
            title={connection === 'live' && !detailed ? LIVE : undefined}
        >
            <i className="connection-status__dot" />

            <span className="connection-status__text">
                {connection === 'live' ? live : 'Нет связи, обновляем раз в 15 с'}
            </span>
        </span>
    );
}
