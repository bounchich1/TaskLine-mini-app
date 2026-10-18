import type { PresetPreview } from './types';

export function presetChanges(preview: PresetPreview | undefined): boolean {
    return (
        !!preview &&
        (preview.add.length > 0 ||
            preview.update.length > 0 ||
            preview.deactivate.length > 0 ||
            preview.levels_described)
    );
}
