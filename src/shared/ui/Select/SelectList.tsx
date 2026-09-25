import { clsx } from 'clsx';
import { useEffect, useRef, type RefObject } from 'react';

import { useAnchoredPopover } from '@/shared/lib/use-anchored-popover';

import { Icon } from '../Icon/Icon';

import { optionId, type SelectOption } from './use-select';

type SelectListProps = {
    id: string;
    options: readonly SelectOption[];
    active: number;
    selected: number;
    anchor: RefObject<HTMLElement | null>;
    label: string | undefined;
    onHighlight: (index: number) => void;
    onChoose: (index: number) => void;
    onClose: () => void;
};

const MAX_HEIGHT = 320;

export function SelectList(props: SelectListProps) {
    const { id, options, active, selected, anchor, label, onHighlight, onChoose, onClose } = props;
    const ref = useRef<HTMLUListElement>(null);

    useAnchoredPopover({ anchor, popover: ref, onClose, matchWidth: true, maxHeight: MAX_HEIGHT });

    useEffect(() => {
        document.getElementById(optionId(id, active))?.scrollIntoView({ block: 'nearest' });
    }, [id, active]);

    return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events
        <ul
            ref={ref}
            id={id}
            role="listbox"
            popover="manual"
            className="select__list"
            aria-label={label}
            onMouseDown={(event) => {
                event.preventDefault();
            }}
            onClick={(event) => {
                event.preventDefault();
                const option = (event.target as Element).closest<HTMLElement>('[role="option"]');

                if (option?.dataset.index) {
                    onChoose(Number(option.dataset.index));
                }
            }}
        >
            {options.map((option, index) => (
                <li
                    key={option.value}
                    id={optionId(id, index)}
                    data-index={index}
                    role="option"
                    aria-selected={index === selected}
                    className={clsx(
                        'select__option',
                        index === active && 'select__option--active',
                        index === selected && 'select__option--selected',
                    )}
                    onPointerMove={() => {
                        onHighlight(index);
                    }}
                >
                    <span className="select__label">
                        {option.label}
                        {option.note ? <span className="select__note"> · {option.note}</span> : null}
                    </span>

                    {index === selected ? <Icon name="check" size={16} className="select__check" /> : null}
                </li>
            ))}

            {options.length === 0 ? (
                <li id={optionId(id, 0)} role="option" aria-selected={false} aria-disabled className="select__empty">
                    Нет вариантов
                </li>
            ) : null}
        </ul>
    );
}
