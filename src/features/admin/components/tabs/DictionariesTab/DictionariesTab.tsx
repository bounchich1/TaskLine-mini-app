import { Button } from '@maxhub/max-ui';

import { AdminCard } from '@/features/admin/components/AdminCard/AdminCard';
import { AdminRow } from '@/features/admin/components/AdminRow/AdminRow';
import { DIMENSION_GROUP_LABELS, DIMENSIONS } from '@/shared/config/labels';
import type { Dictionary } from '@/shared/types/api';

import './DictionariesTab.scss';

type DictionariesTabProps = {
  items: Dictionary[] | undefined;
  /** Opens the dictionary dialog; `null` adds a new value. */
  onEdit: (value: Dictionary | null) => void;
};

/** Classification values by dimension, archived ones included. */
export function DictionariesTab({ items, onEdit }: DictionariesTabProps) {
  return (
    <AdminCard
      title="Справочники классификации"
      action={
        <Button
          size="small"
          onClick={() => {
            onEdit(null);
          }}
        >
          Добавить значение
        </Button>
      }
    >
      <p className="admin-card__help">
        Коды остаются неизменными. Архивные значения сохраняются в истории обращений.
      </p>
      {DIMENSIONS.map((dimension) => (
        <div className="dictionaries-tab__group" key={dimension}>
          <h3 className="dictionaries-tab__group-title">{DIMENSION_GROUP_LABELS[dimension]}</h3>
          {items
            ?.filter((value) => value.dimension === dimension)
            .map((value) => (
              <AdminRow key={value.code}>
                <div className="admin-row__main">
                  <strong className="admin-row__title">{value.label}</strong>
                  <small className="admin-row__meta">
                    {value.code} · приоритет {value.rank} · версия {value.version}
                  </small>
                </div>
                <span className="admin-row__status">
                  {value.active ? 'Используется' : 'В архиве'}
                </span>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => {
                    onEdit(value);
                  }}
                >
                  Изменить
                </Button>
              </AdminRow>
            ))}
        </div>
      ))}
    </AdminCard>
  );
}
