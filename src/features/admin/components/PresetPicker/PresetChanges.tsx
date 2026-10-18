import { presetChanges } from '@/features/admin/model/presets';
import type { PresetPreview } from '@/features/admin/model/types';

function changeLine(title: string, items: readonly string[]) {
    return items.length ? (
        <p className="preset-picker__change">
            <span className="preset-picker__change-title">{title}</span> {items.join(', ')}
        </p>
    ) : null;
}

export function PresetChanges({ preview }: { preview: PresetPreview | undefined }) {
    if (!preview) {
        return <p className="preset-picker__change">Считаем изменения…</p>;
    }

    if (!presetChanges(preview)) {
        return <p className="preset-picker__change">Темы уже совпадают с этим набором.</p>;
    }

    return (
        <>
            {changeLine('Добавятся темы:', preview.add)}
            {changeLine('Обновятся:', preview.update)}
            {changeLine('Выключатся (останутся в истории обращений):', preview.deactivate)}

            {preview.levels_described ? (
                <p className="preset-picker__change">Уровни срочности и сложности получат описания.</p>
            ) : null}
        </>
    );
}
