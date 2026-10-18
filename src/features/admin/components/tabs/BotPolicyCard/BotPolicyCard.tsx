import { Button } from '@maxhub/max-ui';
import { useState } from 'react';

import { AdminCard } from '@/features/admin/components/AdminCard/AdminCard';
import type { AdminSave } from '@/features/admin/hooks/use-admin-save';
import { formText } from '@/features/admin/model/form-data';
import type { BotSettings } from '@/features/admin/model/types';
import { CheckboxField, FormField } from '@/shared/ui';

import { EditionQuestion, type PolicyDraft } from './EditionQuestion';

type BotPolicyCardProps = {
    bot: BotSettings;
    busy: boolean;
    save: AdminSave;
};

function versionNote(bot: BotSettings): string {
    const source = bot.policy_version_source === 'organization' ? 'опубликована в приложении' : 'из настроек сервера';

    return `Действующая редакция: ${bot.policy_version} (${source}).`;
}

export function BotPolicyCard({ bot, busy, save }: BotPolicyCardProps) {
    const [pending, setPending] = useState<PolicyDraft | null>(null);

    const submit = (draft: PolicyDraft, newEdition: boolean) => {
        setPending(null);

        void save('/v1/admin/bot', {
            method: 'PUT',
            body: {
                policy_url: draft.policy_url,
                alternative_contact: draft.alternative_contact,
                menu: bot.menu,
                new_policy_edition: newEdition,
            },
            version: bot.version,
        });
    };

    return (
        <AdminCard title="Клиентам в боте">
            <form
                className="settings-form"
                key={bot.version}
                onSubmit={(event) => {
                    event.preventDefault();
                    const form = new FormData(event.currentTarget);

                    const draft = {
                        policy_url: formText(form, 'policy_url'),
                        alternative_contact: formText(form, 'alternative_contact'),
                        edition: form.get('edition') === 'on',
                    };

                    if (draft.edition || draft.policy_url !== bot.policy_url) {
                        setPending(draft);
                    } else {
                        submit(draft, false);
                    }
                }}
            >
                <FormField label="Политика обработки данных" hint={versionNote(bot)}>
                    <input name="policy_url" type="url" defaultValue={bot.policy_url} maxLength={500} required />
                </FormField>

                <CheckboxField name="edition">Текст политики изменился — запросить согласие заново</CheckboxField>

                <FormField label="Другой способ связи" hint="Видят клиенты, которые отказались от согласия.">
                    <input name="alternative_contact" defaultValue={bot.alternative_contact} maxLength={300} required />
                </FormField>

                <Button className="settings-form__submit" type="submit" size="small" loading={busy}>
                    Сохранить
                </Button>
            </form>

            {pending ? (
                <EditionQuestion
                    draft={pending}
                    busy={busy}
                    onSave={(newEdition) => {
                        submit(pending, newEdition);
                    }}
                    onClose={() => {
                        setPending(null);
                    }}
                />
            ) : null}
        </AdminCard>
    );
}
