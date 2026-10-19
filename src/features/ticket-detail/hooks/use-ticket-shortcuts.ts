import { useEffect, useLayoutEffect, useRef, type Dispatch, type RefObject, type SetStateAction } from 'react';

import { MEDIA } from '@/shared/lib/use-media-query';

import type { TicketDialog } from '../model/dialogs';
import { emptyDraft, type Draft, type DraftMode } from '../model/draft';

type ShortcutOptions = {
    inputRef: RefObject<HTMLTextAreaElement | null>;
    setDraft: Dispatch<SetStateAction<Draft>>;
    abilities: { canNote: boolean; allowed: { close: boolean } } | null;
    openDialog: (dialog: TicketDialog) => void;
};

function switchMode(draft: Draft, mode: DraftMode): Draft {
    if (draft.mode === mode) {
        return draft;
    }

    return draft.text ? { ...draft, mode } : emptyDraft(mode);
}

const KEY_CODES: Record<string, string> = { KeyR: 'r', KeyN: 'n', KeyE: 'e', Slash: '/' };

function shortcutsActive(event: KeyboardEvent): boolean {
    const blocked = event.ctrlKey || event.metaKey || event.altKey || isTyping(event.target);

    return !blocked && window.matchMedia(MEDIA.desktop).matches && !document.querySelector('dialog[open]');
}

const isTyping = (target: EventTarget | null) =>
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

export function useTicketShortcuts(options: ShortcutOptions) {
    const latest = useRef(options);

    useLayoutEffect(() => {
        latest.current = options;
    });

    useEffect(() => {
        const focusComposer = (mode: DraftMode, prefix = '') => {
            const { setDraft, inputRef } = latest.current;

            setDraft((current) => {
                const next = switchMode(current, mode);

                return prefix && !next.text.endsWith(prefix) ? { ...next, text: next.text + prefix } : next;
            });

            requestAnimationFrame(() => inputRef.current?.focus());
        };

        const onKey = (event: KeyboardEvent) => {
            if (!shortcutsActive(event)) {
                return;
            }

            const { abilities, openDialog } = latest.current;
            const key = KEY_CODES[event.code] ?? event.key.toLowerCase();

            const actions: Record<string, () => void> = {
                r: () => {
                    focusComposer('reply');
                },
                '/': () => {
                    focusComposer('reply', '/');
                },
                ...(abilities?.canNote
                    ? {
                          n: () => {
                              focusComposer('note');
                          },
                      }
                    : {}),
                ...(abilities?.allowed.close
                    ? {
                          e: () => {
                              openDialog('close');
                          },
                      }
                    : {}),
            };

            const action = actions[key] as (() => void) | undefined;

            if (action) {
                event.preventDefault();
                action();
            }
        };

        document.addEventListener('keydown', onKey);

        return () => {
            document.removeEventListener('keydown', onKey);
        };
    }, []);
}
