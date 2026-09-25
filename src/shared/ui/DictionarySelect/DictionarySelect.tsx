import type { Dimension } from '@/shared/config/labels';
import type { Dictionary } from '@/shared/types/api';

import { Select, type SelectProps } from '../Select/Select';

type DictionarySelectProps = Omit<SelectProps, 'options'> & {
  items: Dictionary[] | undefined;
  dimension: Dimension;
  /** Adds a first, empty option with this label (e.g. "Все"). */
  emptyLabel?: string;
  /** Hides archived values, except the one currently selected. */
  activeOnly?: boolean;
};

/** A select over one classification dimension; archived values are marked "архив". */
export function DictionarySelect({
  items,
  dimension,
  emptyLabel,
  activeOnly = false,
  ...selectProps
}: DictionarySelectProps) {
  const values = (items ?? [])
    .filter(
      (item) =>
        item.dimension === dimension &&
        (!activeOnly || item.active || item.code === selectProps.value),
    )
    .map((item) => ({
      value: item.code,
      label: item.label,
      note: item.active ? undefined : 'архив',
    }));
  const options = emptyLabel === undefined ? values : [{ value: '', label: emptyLabel }, ...values];
  return <Select {...selectProps} options={options} />;
}
