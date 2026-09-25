import {
  DIMENSION_LABELS,
  DIMENSION_OBJECT_LABELS,
  DIMENSIONS,
  type Dimension,
} from '@/shared/config/labels';
import type { Dictionary, Ticket } from '@/shared/types/api';
import { DictionarySelect } from '@/shared/ui';

import { PropertyRow } from '../PropertyRow/PropertyRow';

type ClassificationFieldsProps = {
  ticket: Ticket;
  dictionaries: Dictionary[];
  disabled: boolean;
  onChange: (field: Dimension, value: string) => void;
};

export function ClassificationFields({
  ticket,
  dictionaries,
  disabled,
  onChange,
}: ClassificationFieldsProps) {
  return DIMENSIONS.map((field) => (
    <PropertyRow label={DIMENSION_LABELS[field]} key={field}>
      <DictionarySelect
        className="property-row__select"
        appearance="plain"
        aria-label={`Изменить ${DIMENSION_OBJECT_LABELS[field]}`}
        disabled={disabled}
        items={dictionaries}
        dimension={field}
        value={ticket[field]}
        onChange={(value) => {
          onChange(field, value);
        }}
        activeOnly
      />
    </PropertyRow>
  ));
}
