import { Button } from '@maxhub/max-ui';
import { useState } from 'react';

import { AdminCard } from '@/features/admin/components/AdminCard/AdminCard';
import { ProfileFields } from '@/features/admin/components/ProfileFields/ProfileFields';
import type { AdminSave } from '@/features/admin/hooks/use-admin-save';
import { profilePayload, readCompanyForm, readToneForm } from '@/features/admin/model/profile-form';
import type { BusinessProfile, Preset } from '@/features/admin/model/types';
import type { Dictionary } from '@/shared/types/api';
import { ErrorNotice } from '@/shared/ui';

import { TopicCoverage } from './TopicCoverage';

import './AssistantTab.scss';

type AssistantTabProps = {
    profile: BusinessProfile;
    presets: readonly Preset[] | undefined;
    dictionaries: readonly Dictionary[] | undefined;
    busy: boolean;
    save: AdminSave;
    onPreset: () => void;
    onSetup: () => void;
};

export function AssistantTab(props: AssistantTabProps) {
    const { profile, presets, dictionaries, busy, save } = props;
    const [formError, setFormError] = useState<unknown>(null);
    const preset = presets?.find((item) => item.id === profile.preset);

    const submit = (form: FormData) => {
        const { draft, error } = readToneForm(form);

        setFormError(error ? new Error(error) : null);

        if (!error) {
            void save('/v1/admin/profile', {
                method: 'PUT',
                body: profilePayload(profile, { ...readCompanyForm(form), ...draft }),
                version: profile.version,
            });
        }
    };

    return (
        <>
            <AdminCard
                title="Сфера бизнеса"
                action={
                    <Button variant="secondary" size="xsmall" onClick={props.onPreset}>
                        Сменить набор
                    </Button>
                }
            >
                <p className="assistant-tab__preset">
                    <strong>{preset?.title ?? 'Набор не выбран'}</strong>
                    {preset ? <span className="assistant-tab__preset-note"> · {preset.summary}</span> : null}
                </p>

                {dictionaries ? <TopicCoverage dictionaries={dictionaries} /> : null}

                <button type="button" className="assistant-tab__link" onClick={props.onSetup}>
                    Пройти настройку заново
                </button>
            </AdminCard>

            <AdminCard title="О компании и ответах клиентам">
                <p className="admin-card__help">
                    ИИ получает эти данные как справку о компании. Они не меняют правила безопасности и не отправляются
                    клиентам напрямую.
                </p>

                <ErrorNotice error={formError} />

                <form
                    className="assistant-tab__form"
                    key={profile.version}
                    onSubmit={(event) => {
                        event.preventDefault();
                        submit(new FormData(event.currentTarget));
                    }}
                >
                    <ProfileFields profile={profile} company />

                    <Button className="assistant-tab__submit" type="submit" size="small" loading={busy}>
                        Сохранить
                    </Button>
                </form>
            </AdminCard>
        </>
    );
}
