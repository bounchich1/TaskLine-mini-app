import type { Macro } from '@/shared/types/routing';
import { Empty, Icon } from '@/shared/ui';

import '../MacroManager/MacroManager.scss';

type MacroListProps = {
    macros: Macro[];
    busy: boolean;
    onEdit: (macro: Macro) => void;
    onRemove: (macro: Macro) => void;
};

export function MacroList({ macros, busy, onEdit, onRemove }: MacroListProps) {
    if (!macros.length) {
        return (
            <Empty title="Личных шаблонов пока нет">
                Сохраните частый ответ и вставляйте его в поле ответа через «/». Общие шаблоны настраивает
                администратор.
            </Empty>
        );
    }

    return (
        <ul className="macro-manager__list">
            {macros.map((macro) => (
                <li key={macro.id} className="macro-manager__item">
                    <button
                        type="button"
                        className="macro-manager__open"
                        onClick={() => {
                            onEdit(macro);
                        }}
                    >
                        <span className="macro-manager__title">{macro.title}</span>
                        <span className="macro-manager__body">{macro.body}</span>
                    </button>

                    <button
                        type="button"
                        className="macro-manager__delete"
                        aria-label={`Удалить шаблон «${macro.title}»`}
                        disabled={busy}
                        onClick={() => {
                            onRemove(macro);
                        }}
                    >
                        <Icon name="close" size={16} />
                    </button>
                </li>
            ))}
        </ul>
    );
}
