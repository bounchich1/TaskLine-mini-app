import { clsx } from 'clsx';
import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';

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

const GAP = 4;
const MARGIN = 8;
const MAX_HEIGHT = 320;

function place(anchor: HTMLElement, list: HTMLElement) {
  const rect = anchor.getBoundingClientRect();
  const below = window.innerHeight - rect.bottom - GAP - MARGIN;
  const above = rect.top - GAP - MARGIN;
  const upward = list.scrollHeight > below && above > below;
  list.style.minWidth = `${rect.width}px`;
  list.style.maxHeight = `${Math.min(MAX_HEIGHT, upward ? above : below)}px`;
  const left = Math.min(rect.left, window.innerWidth - list.offsetWidth - MARGIN);
  list.style.left = `${Math.max(MARGIN, left)}px`;
  list.style.top = `${upward ? rect.top - GAP - list.offsetHeight : rect.bottom + GAP}px`;
}

export function SelectList(props: SelectListProps) {
  const { id, options, active, selected, anchor, label, onHighlight, onChoose, onClose } = props;
  const ref = useRef<HTMLUListElement>(null);
  useLayoutEffect(() => {
    const list = ref.current;
    const root = anchor.current;
    if (!list || !root || !('showPopover' in list)) {
      return;
    }
    list.showPopover();
    const update = () => {
      place(root, list);
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [anchor]);
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!anchor.current?.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('pointerdown', outside, true);
    return () => {
      document.removeEventListener('pointerdown', outside, true);
    };
  }, [anchor, onClose]);
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
        <li
          id={optionId(id, 0)}
          role="option"
          aria-selected={false}
          aria-disabled
          className="select__empty"
        >
          Нет вариантов
        </li>
      ) : null}
    </ul>
  );
}
