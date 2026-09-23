import { statusLabel } from '@/shared/config/labels';

import './Badge.scss';

/** The BEM modifier for a ticket status, e.g. `badge--status-in-progress`. */
const statusModifier = (status: string) => `badge--status-${status.replaceAll('_', '-')}`;

/** A ticket status pill. */
export function Badge({ status }: { status: string }) {
  return (
    <span className={`badge ${statusModifier(status)}`}>
      <span className="badge__dot" />
      {statusLabel(status)}
    </span>
  );
}
