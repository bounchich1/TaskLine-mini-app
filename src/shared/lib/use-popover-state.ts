import { useCallback, useRef, useState, type FocusEvent } from 'react';

export function usePopoverState() {
    const [open, setOpen] = useState(false);
    const root = useRef<HTMLDivElement>(null);
    const trigger = useRef<HTMLButtonElement>(null);

    const close = useCallback(() => {
        if (root.current?.contains(document.activeElement)) {
            trigger.current?.focus();
        }

        setOpen(false);
    }, []);

    return {
        open,
        root,
        trigger,
        close,
        toggle: () => {
            setOpen(!open);
        },
        onBlur: (event: FocusEvent) => {
            if (open && !root.current?.contains(event.relatedTarget)) {
                setOpen(false);
            }
        },
    };
}
