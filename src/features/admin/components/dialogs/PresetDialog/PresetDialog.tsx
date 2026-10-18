import { Button } from '@maxhub/max-ui';
import { useState } from 'react';

import { PresetPicker } from '@/features/admin/components/PresetPicker/PresetPicker';
import type { AdminSave } from '@/features/admin/hooks/use-admin-save';
import { usePresetPreview, usePresets } from '@/features/admin/hooks/use-presets';
import { presetChanges } from '@/features/admin/model/presets';
import type { BusinessProfile } from '@/features/admin/model/types';
import { ErrorNotice, Modal } from '@/shared/ui';

type PresetDialogProps = {
    profile: BusinessProfile;
    busy: boolean;
    error: unknown;
    save: AdminSave;
    onClose: () => void;
};

export function PresetDialog({ profile, busy, error, save, onClose }: PresetDialogProps) {
    const presets = usePresets();
    const [chosen, setChosen] = useState(profile.preset ?? 'general');
    const preview = usePresetPreview(chosen);
    const ready = preview.data?.id === chosen;

    return (
        <Modal
            title="Отраслевой набор"
            onClose={onClose}
            busy={busy}
            wide
            footer={
                <Button
                    size="small"
                    loading={busy}
                    disabled={!ready || !presetChanges(preview.data)}
                    onClick={() => {
                        void save(`/v1/admin/presets/${chosen}/apply`, {
                            method: 'POST',
                            body: {},
                            version: profile.version,
                        });
                    }}
                >
                    Применить набор
                </Button>
            }
        >
            <ErrorNotice error={error} />

            <p>
                Набор добавит темы с описаниями для ИИ и описания уровней срочности. Темы, которых нет в наборе,
                выключатся, но останутся в истории обращений. Ваши правила и глоссарий дополнятся, а не заменятся.
            </p>

            {presets.data ? (
                <PresetPicker presets={presets.data.items} value={chosen} preview={preview.data} onChange={setChosen} />
            ) : null}
        </Modal>
    );
}
