import { Button } from '@maxhub/max-ui';

import { AdminCard } from '@/features/admin/components/AdminCard/AdminCard';
import { AdminRow } from '@/features/admin/components/AdminRow/AdminRow';
import { DIMENSION_GROUP_LABELS, DIMENSIONS } from '@/shared/config/labels';
import type { Dictionary } from '@/shared/types/api';

import './DictionariesTab.scss';

type DictionariesTabProps = {
  items: Dictionary[] | undefined;
  onEdit: (value: Dictionary | null) => void;
};

export function DictionariesTab({ items, onEdit }: DictionariesTabProps) {
  return (
    <AdminCard
      title="Справочники классификации"
      action={
        <Button
          size="xsmall"
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
          <div className="admin-card__list">
            {items
              ?.filter((value) => value.dimension === dimension)
              .map((value) => (
                <AdminRow key={value.code}>
                  <div className="admin-row__main">
                    <strong className="admin-row__title">{value.label}</strong>
                    <small className="admin-row__meta">
                      <code>{value.code}</code> · приоритет {value.rank} · версия {value.version}
                      {value.active ? null : <span className="admin-row__status"> · В архиве</span>}
                    </small>
                  </div>
                  <Button
                    variant="secondary"
                    size="xsmall"
                    onClick={() => {
                      onEdit(value);
                    }}
                  >
                    Изменить
                  </Button>
                </AdminRow>
              ))}
          </div>
        </div>
      ))}
    </AdminCard>
  );
}
