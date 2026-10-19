import { clsx } from 'clsx';

import type { DeltaView } from '@/features/reports/model/format';

import './Delta.scss';

const ARROWS = { up: '↑', down: '↓', flat: '' } as const;

type DeltaProps = { delta: DeltaView | null; previous?: string };

export function Delta({ delta, previous }: DeltaProps) {
    if (!delta) {
        return <span className="delta delta--none">{previous ? `было ${previous}` : null}</span>;
    }

    return (
        <span
            className={clsx('delta', `delta--${delta.tone}`)}
            title={previous ? `Предыдущий период: ${previous}` : undefined}
        >
            {ARROWS[delta.direction] ? (
                <span className="delta__arrow" aria-hidden>
                    {ARROWS[delta.direction]}
                </span>
            ) : null}

            <span className="delta__text">{delta.text}</span>
        </span>
    );
}
