import { useState, type Dispatch, type KeyboardEvent, type SetStateAction } from 'react';

import { matchMacros, renderMacro } from '@/features/routing';
import type { Draft } from '@/features/ticket-detail/model/draft';
import type { Employee } from '@/shared/types/api';
import type { Macro } from '@/shared/types/routing';

export type SuggestItem = { id: string; title: string; detail: string };

type Token = { kind: 'mention' | 'macro'; query: string; start: number; end: number };

const MENTION = /(^|\s)@([\p{L}\p{N}_-]{0,30})$/u;
const MACRO = /(^|\s)\/([\p{L}\p{N} ]{0,40})$/u;
const LIMIT = 8;

function findToken(draft: Draft, caret: number): Token | null {
    const before = draft.text.slice(0, caret);
    const match = (draft.mode === 'note' ? MENTION : MACRO).exec(before);

    if (!match) {
        return null;
    }

    const query = match[2];

    return { kind: draft.mode === 'note' ? 'mention' : 'macro', query, start: caret - query.length - 1, end: caret };
}

type SuggestOptions = {
    draft: Draft;
    setDraft: Dispatch<SetStateAction<Draft>>;
    employees: Employee[];
    macros: Macro[];
    macroContext: { ticketNumber: string; agentName: string; eta: string };
    me: string;
};

function itemsFor(token: Token, { employees, macros, me }: SuggestOptions): SuggestItem[] {
    if (token.kind === 'macro') {
        return matchMacros(macros, token.query).map((macro) => ({
            id: macro.id,
            title: macro.title,
            detail: macro.shared ? 'общий шаблон' : 'мой шаблон',
        }));
    }

    const needle = token.query.toLowerCase();

    return employees
        .filter((employee) => employee.id !== me && employee.status === 'active')
        .filter((employee) => employee.name.toLowerCase().includes(needle))
        .slice(0, LIMIT)
        .map((employee) => ({ id: employee.id, title: employee.name, detail: '' }));
}

type KeyActions = {
    open: boolean;
    count: number;
    move: Dispatch<SetStateAction<number>>;
    close: () => void;
    pick: () => void;
};

const MOVES: Record<string, number> = { ArrowDown: 1, ArrowUp: -1 };

function handleSuggestKey(event: KeyboardEvent<HTMLTextAreaElement>, actions: KeyActions): boolean {
    const step = MOVES[event.key] as number | undefined;
    const choosing = event.key === 'Enter' || event.key === 'Tab';

    if (!actions.open || (step === undefined && !choosing && event.key !== 'Escape')) {
        return false;
    }

    event.preventDefault();

    if (step !== undefined) {
        actions.move((current) => (current + step + actions.count) % actions.count);
    } else if (choosing) {
        actions.pick();
    } else {
        actions.close();
    }

    return true;
}

export function useComposerSuggest(options: SuggestOptions) {
    const { draft, setDraft } = options;
    const [caret, setCaret] = useState(0);
    const [active, setActive] = useState(0);
    const [closedAt, setClosedAt] = useState<number | null>(null);
    const token = closedAt === caret ? null : findToken(draft, caret);
    const items = token ? itemsFor(token, options) : [];
    const open = items.length > 0;

    const choose = (item: SuggestItem): number => {
        if (!token) {
            return caret;
        }

        const macro = options.macros.find((entry) => entry.id === item.id);

        const insert =
            token.kind === 'macro' && macro ? renderMacro(macro.body, options.macroContext) : `@${item.title} `;

        const text = draft.text.slice(0, token.start) + insert + draft.text.slice(token.end);

        setDraft((current) =>
            token.kind === 'macro'
                ? { ...current, text, origin: 'macro', macroId: item.id }
                : { ...current, text, mentions: [...new Set([...current.mentions, item.id])] },
        );

        setActive(0);

        return token.start + insert.length;
    };

    const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>, moveCaret: (position: number) => void) =>
        handleSuggestKey(event, {
            open,
            count: items.length,
            move: setActive,
            close: () => {
                setClosedAt(caret);
            },
            pick: () => {
                const item = items.at(Math.min(active, items.length - 1));

                if (item) {
                    moveCaret(choose(item));
                }
            },
        });

    return {
        items,
        active: Math.min(active, Math.max(0, items.length - 1)),
        kind: token?.kind ?? null,
        open,
        choose,
        onKeyDown,
        trackCaret: (position: number) => {
            if (position !== caret) {
                setCaret(position);
                setClosedAt(null);
            }
        },
    };
}

export type ComposerSuggest = ReturnType<typeof useComposerSuggest>;
