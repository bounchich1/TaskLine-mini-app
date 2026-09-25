import { clsx } from 'clsx';

import './Urgency.scss';

/** How many of the four bars each known urgency fills; unknown codes fill none. */
const LEVELS: Partial<Record<string, number>> = { low: 1, medium: 2, high: 3, critical: 4 };
const BARS = [0, 1, 2, 3];

type UrgencyProps = {
  code: string;
  /** The label to show; e.g. "Определяется" while the ticket is being classified. */
  label: string;
  className?: string;
};

/** An urgency: signal bars (count and color) and its name. */
export function Urgency({ code, label, className }: UrgencyProps) {
  const level = LEVELS[code] ?? 0;
  return (
    <span className={clsx('urgency', `urgency--${level}`, className)}>
      <svg className="urgency__bars" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        {BARS.map((bar) => (
          <rect
            key={bar}
            className={clsx('urgency__bar', bar < level && 'urgency__bar--on')}
            x={bar * 3.5 + 0.5}
            y={10 - bar * 3}
            width="2.5"
            height={3 + bar * 3}
            rx="1"
          />
        ))}
      </svg>
      {label}
    </span>
  );
}
