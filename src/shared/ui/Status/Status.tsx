import { clsx } from 'clsx';

import { statusLabel } from '@/shared/config/labels';

import { StatusGlyph } from '../StatusGlyph/StatusGlyph';

import './Status.scss';

/** A ticket status: its glyph and name. The glyph differs per status, so color is not the only cue. */
export function Status({ status, className }: { status: string; className?: string }) {
  return (
    <span className={clsx('status', `status--${status.replaceAll('_', '-')}`, className)}>
      <StatusGlyph status={status} />
      {statusLabel(status)}
    </span>
  );
}
