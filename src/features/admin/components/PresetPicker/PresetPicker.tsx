import { ChoiceList } from '@/features/admin/components/ChoiceList/ChoiceList';
import type { Preset, PresetPreview } from '@/features/admin/model/types';

import { PresetChanges } from './PresetChanges';

import './PresetPicker.scss';

type PresetPickerProps = {
    presets: readonly Preset[];
    value: string;
    preview: PresetPreview | undefined;
    onChange: (id: string) => void;
};

export function PresetPicker({ presets, value, preview, onChange }: PresetPickerProps) {
    const options = presets.map((preset) => ({ value: preset.id, title: preset.title, note: preset.summary }));

    return (
        <div className="preset-picker">
            <ChoiceList name="preset" legend="Сфера бизнеса" options={options} value={value} onChange={onChange} />

            <div className="preset-picker__preview" aria-live="polite">
                <PresetChanges preview={preview?.id === value ? preview : undefined} />
            </div>
        </div>
    );
}
