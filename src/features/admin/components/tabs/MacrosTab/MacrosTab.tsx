import { Button } from '@maxhub/max-ui';

import { AdminCard } from '@/features/admin/components/AdminCard/AdminCard';
import { AdminRow } from '@/features/admin/components/AdminRow/AdminRow';
import { describeActions } from '@/features/routing';
import type { Dictionary } from '@/shared/types/api';
import type { Macro } from '@/shared/types/routing';
import { Empty } from '@/shared/ui';

type MacrosTabProps = {
    macros: Macro[] | undefined;
    dictionaries: Dictionary[] | undefined;
    onEdit: (macro: Macro | null) => void;
};

export function MacrosTab({ macros, dictionaries, onEdit }: MacrosTabProps) {
    const shared = macros?.filter((macro) => macro.shared);

    const label = (dimension: string, code: string) =>
        dictionaries?.find((item) => item.dimension === dimension && item.code === code)?.label ?? code;

    return (
        <AdminCard
            title="Общие шаблоны ответов"
            action={
                <Button
                    size="small"
                    onClick={() => {
                        onEdit(null);
                    }}
                >
                    Новый шаблон
                </Button>
            }
        >
            <p className="admin-card__help">
                Сотрудники вставляют шаблон через «/» в поле ответа. Шаблон может сразу поменять тему или срочность,
                поставить ожидание клиента или закрыть обращение после доставки ответа. Личные шаблоны сотрудники ведут
                сами в профиле.
            </p>

            {shared?.length === 0 ? <Empty title="Общих шаблонов пока нет" /> : null}

            <div className="admin-card__list">
                {shared?.map((macro) => (
                    <AdminRow key={macro.id} wrap>
                        <div className="admin-row__main">
                            <span className="admin-row__title">{macro.title}</span>
                            <span className="admin-row__meta">{macro.body}</span>

                            {describeActions(macro.actions, label) ? (
                                <span className="admin-row__meta">
                                    Действия: {describeActions(macro.actions, label)}
                                </span>
                            ) : null}
                        </div>

                        <span className="admin-row__status">использован {macro.uses} раз</span>

                        <Button
                            variant="secondary"
                            size="xsmall"
                            aria-label={`Изменить шаблон «${macro.title}»`}
                            onClick={() => {
                                onEdit(macro);
                            }}
                        >
                            Изменить
                        </Button>
                    </AdminRow>
                ))}
            </div>
        </AdminCard>
    );
}
