import { useCallback, useRef, useState, type KeyboardEvent } from 'react';

export type SelectOption = {
  value: string;
  label: string;
  /** A muted remark after the label, e.g. "архив". */
  note?: string;
};

/** Whether the list is open and which option is highlighted. */
type ListView = { open: boolean; active: number };

type ListState = ListView & { selected: number; last: number };

/** The DOM id of an option, for the trigger's aria-activedescendant. */
export const optionId = (listId: string, index: number) => `${listId}-${index}`;

/** Keys typed within this interval search together ("не" finds "Не назначен"). */
const TYPEAHEAD_MS = 600;
const PAGE = 10;

const isPrintable = (event: KeyboardEvent) =>
  event.key.length === 1 && event.key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey;

/** Where a key opens the closed list, or moves the highlight in the open one. */
function targetIndex(key: string, { open, active, selected, last }: ListState) {
  const targets: Record<string, number> = open
    ? { ArrowDown: active + 1, ArrowUp: active - 1, PageDown: active + PAGE, PageUp: active - PAGE }
    : {
        ArrowDown: selected,
        ArrowUp: selected < 0 ? last : selected,
        Enter: selected,
        ' ': selected,
      };
  return { ...targets, Home: 0, End: last }[key];
}

/** What a non-printable key does, as in a native select: a new view, a choice, or nothing. */
function keyAction(key: string, state: ListState): ListView | 'choose' | null {
  if (state.open && (key === 'Escape' || key === 'Tab')) {
    return { open: false, active: state.active };
  }
  if (state.open && (key === 'Enter' || key === ' ')) {
    return 'choose';
  }
  const index = targetIndex(key, state);
  return index === undefined
    ? null
    : { open: true, active: Math.max(0, Math.min(state.last, index)) };
}

/** The first option from `start` whose label begins with `text`, wrapping around. */
function findByPrefix(options: readonly SelectOption[], text: string, start: number) {
  const prefix = text.toLowerCase();
  for (let step = 0; step < options.length; step++) {
    const index = (start + step) % options.length;
    if (options[index].label.toLowerCase().startsWith(prefix)) {
      return index;
    }
  }
  return -1;
}

/**
 * Type-to-find: letters typed in quick succession form one prefix; a single letter starts after
 * the current option, so pressing it again cycles through the matches.
 */
function useTypeahead(options: readonly SelectOption[]) {
  const typed = useRef({ text: '', at: 0 });
  return (key: string, from: number): ListView | null => {
    const now = Date.now();
    const text = (now - typed.current.at < TYPEAHEAD_MS ? typed.current.text : '') + key;
    typed.current = { text, at: now };
    const index = findByPrefix(options, text, text.length === 1 ? from + 1 : from);
    return index < 0 ? null : { open: true, active: index };
  };
}

type ValueOptions = {
  /** Controlled value; without it the select keeps its own, starting at `defaultValue`. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
};

/**
 * The value, open state, highlighted option and keyboard handling of a select-only combobox.
 */
export function useSelect(options: readonly SelectOption[], valueOptions: ValueOptions) {
  const { defaultValue = '', onChange } = valueOptions;
  const [ownValue, setOwnValue] = useState(defaultValue);
  const value = valueOptions.value ?? ownValue;
  const [view, setView] = useState<ListView>({ open: false, active: 0 });
  const typeahead = useTypeahead(options);
  const close = useCallback(() => {
    setView((current) => ({ ...current, open: false }));
  }, []);
  const selected = options.findIndex((option) => option.value === value);
  const choose = (index: number) => {
    setView({ open: false, active: index });
    const option = options.at(index);
    if (option && option.value !== value) {
      setOwnValue(option.value);
      onChange?.(option.value);
    }
  };
  const onKeyDown = (event: KeyboardEvent) => {
    const state = { ...view, selected, last: options.length - 1 };
    // Typing only highlights: a change (possibly a server command) needs Enter or a click.
    const next = isPrintable(event)
      ? typeahead(event.key, view.open ? view.active : Math.max(selected, 0))
      : keyAction(event.key, state);
    if (next === null) {
      return;
    }
    // Tab still moves focus on; other keys are the select's alone (Escape keeps a dialog open).
    if (event.key !== 'Tab') {
      event.preventDefault();
      event.stopPropagation();
    }
    if (next === 'choose') {
      choose(view.active);
    } else {
      setView(next);
    }
  };
  return {
    ...view,
    value,
    selected,
    choose,
    highlight: (active: number) => {
      setView({ open: true, active });
    },
    close,
    toggle: () => {
      setView({ open: !view.open, active: Math.max(selected, 0) });
    },
    onKeyDown,
  };
}
