import type { ConnectionState } from '@/shared/api/events-stream';

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
      <span className={`connection ${connection}`}>
        <i />
        {connection === 'live' ? 'Обновляется в реальном времени' : 'Восстанавливаем связь'}
      </span>
    </header>
  );
}
