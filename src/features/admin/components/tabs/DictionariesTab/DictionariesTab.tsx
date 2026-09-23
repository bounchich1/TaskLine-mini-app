import { Button } from '@maxhub/max-ui';

import { DIMENSION_GROUP_LABELS, DIMENSIONS } from '@/shared/config/labels';
import type { Dictionary } from '@/shared/types/api';

type DictionariesTabProps = {
  items: Dictionary[] | undefined;
  /** Opens the dictionary dialog; `null` adds a new value. */
  onEdit: (value: Dictionary | null) => void;
};

/** Classification values by dimension, archived ones included. */
export function DictionariesTab({ items, onEdit }: DictionariesTabProps) {
  return (
    <section className="admin-card">
      <div className="admin-card-head">
        <h2>Справочники классификации</h2>
        <Button
          size="small"
          onClick={() => {
            onEdit(null);
          }}
        >
          Добавить значение
        </Button>
      </div>
      <p className="admin-help">
        Коды остаются неизменными. Архивные значения сохраняются в истории обращений.
      </p>
      {DIMENSIONS.map((dimension) => (
        <div className="dictionary-group" key={dimension}>
          <h3>{DIMENSION_GROUP_LABELS[dimension]}</h3>
          {items
            ?.filter((value) => value.dimension === dimension)
            .map((value) => (
              <div className="admin-row" key={value.code}>
                <div>
                  <strong>{value.label}</strong>
                  <small>
                    {value.code} · приоритет {value.rank} · версия {value.version}
                  </small>
                </div>
                <span className="muted">{value.active ? 'Используется' : 'В архиве'}</span>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => {
                    onEdit(value);
                  }}
                >
                  Изменить
                </Button>
              </div>
            ))}
        </div>
      ))}
    </section>
  );
}
