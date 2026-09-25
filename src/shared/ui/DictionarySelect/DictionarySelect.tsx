import type { Dimension } from '@/shared/config/labels';
import type { Dictionary } from '@/shared/types/api';

import { Select, type SelectProps } from '../Select/Select';

type DictionarySelectProps = Omit<SelectProps, 'options'> & {
  items: Dictionary[] | undefined;
  dimension: Dimension;
  emptyLabel?: string;
  activeOnly?: boolean;
};

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
