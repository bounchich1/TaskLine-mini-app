import { useState } from 'react';

import { usePresetPreview, usePresets } from '@/features/admin/hooks/use-presets';
import type { SetupStepProps } from '@/features/admin/hooks/use-setup-wizard';
import { presetChanges } from '@/features/admin/model/presets';
import type { BusinessProfile } from '@/features/admin/model/types';
import { api } from '@/shared/api/http';

import { PresetPicker } from '../PresetPicker/PresetPicker';

export function IndustryStep({ wizard, formId }: SetupStepProps) {
    const presets = usePresets();
    const [chosen, setChosen] = useState(wizard.profile.preset ?? 'general');
    const preview = usePresetPreview(chosen);

    const apply = async () => {
        const changes = preview.data?.id === chosen ? preview.data : (await preview.refetch()).data;

        if (!presetChanges(changes)) {
            return;
        }

        const applied = await api<{ profile: BusinessProfile }>(`/v1/admin/presets/${chosen}/apply`, {
            method: 'POST',
            body: {},
            version: wizard.profile.version,
        });

        wizard.setProfile(applied.profile);
    };

    return (
        <form
            id={formId}
            className="setup-step"
            onSubmit={(event) => {
                event.preventDefault();
                void wizard.run(apply);
            }}
        >
            <p className="setup-step__lead">
                Выберите сферу — бот получит готовый набор тем обращений с описаниями для ИИ. Всё можно поменять позже.
            </p>

            {presets.data ? (
                <PresetPicker presets={presets.data.items} value={chosen} preview={preview.data} onChange={setChosen} />
            ) : null}
        </form>
    );
}
