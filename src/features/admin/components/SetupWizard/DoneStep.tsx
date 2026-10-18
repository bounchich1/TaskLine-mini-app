import { useQuery } from '@tanstack/react-query';

import { usePresets } from '@/features/admin/hooks/use-presets';
import type { SetupStepProps } from '@/features/admin/hooks/use-setup-wizard';
import { TONE_OPTIONS } from '@/features/admin/model/profile-form';
import { dictionariesQuery } from '@/shared/api/reference-data';

export function DoneStep({ wizard, formId }: SetupStepProps) {
    const presets = usePresets();
    const dictionaries = useQuery(dictionariesQuery);
    const { profile } = wizard;
    const preset = presets.data?.items.find((item) => item.id === profile.preset);

    const topics = dictionaries.data?.items.filter(
        (item) => item.dimension === 'tag' && item.active && item.code !== 'undefined',
    );

    const described = topics?.filter((item) => item.description).length ?? 0;

    return (
        <form
            id={formId}
            className="setup-step"
            onSubmit={(event) => {
                event.preventDefault();
                void wizard.run(() => wizard.saveProfile({}, true), true);
            }}
        >
            <p className="setup-step__lead">Проверьте итог. Всё это можно поменять в разделе «Управление».</p>

            <dl className="setup-summary">
                <dt>Сфера</dt>
                <dd>{preset?.title ?? 'Своя'}</dd>
                <dt>Темы обращений</dt>
                <dd>{topics ? `${topics.length}, с описанием ${described}` : '—'}</dd>
                <dt>Тон ответов</dt>
                <dd>{TONE_OPTIONS.find((tone) => tone.value === profile.tone)?.label}</dd>
                <dt>Правила</dt>
                <dd>{profile.rules.length || 'нет'}</dd>
                <dt>Глоссарий</dt>
                <dd>{profile.glossary.length || 'пуст'}</dd>
            </dl>
        </form>
    );
}
