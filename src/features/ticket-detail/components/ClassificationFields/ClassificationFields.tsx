import {
  DIMENSION_LABELS,
  DIMENSION_OBJECT_LABELS,
  DIMENSIONS,
  type Dimension,
} from '@/shared/config/labels';
import type { Dictionary, Ticket } from '@/shared/types/api';
import { DictionarySelect } from '@/shared/ui';

import './ClassificationFields.scss';

type ClassificationFieldsProps = {
  ticket: Ticket;
  dictionaries: Dictionary[];
  disabled: boolean;
  onChange: (field: Dimension, value: string) => void;
};

/** Tag, urgency and complexity of the ticket; archived values only if already selected. */
export function ClassificationFields({
  ticket,
  dictionaries,
  disabled,
  onChange,
}: ClassificationFieldsProps) {
  return DIMENSIONS.map((field) => (
    <label className="classification__field" key={field}>
      {DIMENSION_LABELS[field]}
      <DictionarySelect
        className="classification__select"
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
    </label>
  ));
}
