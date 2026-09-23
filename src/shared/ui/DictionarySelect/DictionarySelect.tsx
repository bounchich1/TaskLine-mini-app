import type { SelectHTMLAttributes } from 'react';

import type { Dimension } from '@/shared/config/labels';
import type { Dictionary } from '@/shared/types/api';

type DictionarySelectProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'value' | 'onChange' | 'children'
> & {
  items: Dictionary[] | undefined;
  dimension: Dimension;
  value: string;
  onChange: (value: string) => void;
  /** Adds a first, empty option with this label (e.g. "Все"). */
  emptyLabel?: string;
  /** Hides archived values, except the one currently selected. */
  activeOnly?: boolean;
};

/** A `<select>` over one classification dimension; archived values are marked "(архив)". */
export function DictionarySelect({
  items,
  dimension,
  value,
  onChange,
  emptyLabel,
  activeOnly = false,
  ...selectProps
}: DictionarySelectProps) {
  const options = items?.filter(
    (item) => item.dimension === dimension && (!activeOnly || item.active || item.code === value),
  );
  return (
    <select
      {...selectProps}
      value={value}
      onChange={(event) => {
        onChange(event.target.value);
      }}
    >
      {emptyLabel === undefined ? null : <option value="">{emptyLabel}</option>}
      {options?.map((item) => (
        <option key={item.code} value={item.code}>
          {item.label}
          {item.active ? '' : ' (архив)'}
        </option>
      ))}
    </select>
  );
}
