import { clsx } from 'clsx';

import type { ConnectionState } from '@/shared/api/events-stream';

import './Topbar.scss';

/** The organization's name and whether live updates are flowing. */
export function Topbar({
  organization,
  connection,
}: {
  organization: string;
  connection: ConnectionState;
}) {
  return (
    <header className="topbar">
      <span>{organization}</span>
      <span className="topbar__connection">
        <i
          className={clsx(
            'topbar__dot',
            connection === 'reconnecting' && 'topbar__dot--reconnecting',
          )}
        />
        {connection === 'live' ? 'Обновляется в реальном времени' : 'Восстанавливаем связь'}
      </span>
    </header>
  );
}
