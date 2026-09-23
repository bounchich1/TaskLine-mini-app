import { statusLabel } from '@/shared/config/labels';

/** A ticket status pill. */
export function Badge({ status }: { status: string }) {
  return (
    <span className={`badge status-${status}`}>
      <span className="status-dot" />
      {statusLabel(status)}
    </span>
  );
}
