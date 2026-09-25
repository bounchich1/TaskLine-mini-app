import { useEffect, useLayoutEffect, type RefObject } from 'react';

type Placement = { align?: 'start' | 'end'; matchWidth?: boolean; maxHeight?: number };

type AnchoredPopover = Placement & {
    anchor: RefObject<HTMLElement | null>;
    popover: RefObject<HTMLElement | null>;
    onClose: () => void;
};

const GAP = 4;
const MARGIN = 8;

function place(anchor: HTMLElement, popover: HTMLElement, placement: Placement) {
    const { align = 'start', matchWidth = false, maxHeight = Infinity } = placement;
    const rect = anchor.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom - GAP - MARGIN;
    const above = rect.top - GAP - MARGIN;
    const upward = popover.scrollHeight > below && above > below;

    if (matchWidth) {
        popover.style.minWidth = `${rect.width}px`;
    }

    popover.style.maxHeight = `${Math.min(maxHeight, upward ? above : below)}px`;
    const start = align === 'end' ? rect.right - popover.offsetWidth : rect.left;
    const left = Math.min(start, window.innerWidth - popover.offsetWidth - MARGIN);

    popover.style.left = `${Math.max(MARGIN, left)}px`;
    popover.style.top = `${upward ? rect.top - GAP - popover.offsetHeight : rect.bottom + GAP}px`;
}

export function useAnchoredPopover({ anchor, popover, onClose, ...placement }: AnchoredPopover) {
    const { align, matchWidth, maxHeight } = placement;

    useLayoutEffect(() => {
        const element = popover.current;
        const root = anchor.current;

        if (!element || !root || !('showPopover' in element)) {
            return;
        }

        element.showPopover();

        const update = () => {
            place(root, element, { align, matchWidth, maxHeight });
        };

        update();
        window.addEventListener('resize', update);
        window.addEventListener('scroll', update, true);

        return () => {
            window.removeEventListener('resize', update);
            window.removeEventListener('scroll', update, true);
        };
    }, [anchor, popover, align, matchWidth, maxHeight]);

    useEffect(() => {
        const outside = (event: PointerEvent) => {
            if (!anchor.current?.contains(event.target as Node)) {
                onClose();
            }
        };

        const escape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('pointerdown', outside, true);
        document.addEventListener('keydown', escape);

        return () => {
            document.removeEventListener('pointerdown', outside, true);
            document.removeEventListener('keydown', escape);
        };
    }, [anchor, onClose]);
}
