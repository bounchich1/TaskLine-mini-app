import { clsx } from 'clsx';

import { statusLabel } from '@/shared/config/labels';

import { StatusGlyph } from '../StatusGlyph/StatusGlyph';

import './Status.scss';

export function Status({ status, className }: { status: string; className?: string }) {
  return (
    <span className={clsx('status', `status--${status.replaceAll('_', '-')}`, className)}>
      <StatusGlyph status={status} />
      {statusLabel(status)}
    </span>
  );
}
