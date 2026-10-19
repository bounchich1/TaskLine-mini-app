import { useEffect, useLayoutEffect, useRef, type Dispatch, type SetStateAction } from 'react';

import type { Ticket } from '@/shared/types/api';

type QueueKeysOptions = {
    rows: Ticket[];
    expanded: string | null;
    onExpand: Dispatch<SetStateAction<string | null>>;
    enabled: boolean;
};

const STEPS: Record<string, number> = { KeyJ: 1, KeyK: -1 };

const isTyping = (target: EventTarget | null) =>
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

export function useQueueKeys(options: QueueKeysOptions) {
    const latest = useRef(options);

    useLayoutEffect(() => {
        latest.current = options;
    });

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            const { rows, expanded, onExpand, enabled } = latest.current;
            const step = STEPS[event.code] as number | undefined;
            const blocked = event.ctrlKey || event.metaKey || event.altKey || isTyping(event.target);

            if (!enabled || step === undefined || blocked || !rows.length || document.querySelector('dialog[open]')) {
                return;
            }

            event.preventDefault();
            const index = rows.findIndex((row) => row.id === expanded);
            const next = rows.at(Math.min(rows.length - 1, Math.max(0, index === -1 ? 0 : index + step)));

            if (next) {
                onExpand(next.id);
            }
        };

        document.addEventListener('keydown', onKey);

        return () => {
            document.removeEventListener('keydown', onKey);
        };
    }, []);
}
