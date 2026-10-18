import { Button } from '@maxhub/max-ui';

import { AdminCard } from '@/features/admin/components/AdminCard/AdminCard';
import type { AdminSave } from '@/features/admin/hooks/use-admin-save';
import { formText } from '@/features/admin/model/form-data';
import type { BotSettings, MenuLabels } from '@/features/admin/model/types';
import { FormField } from '@/shared/ui';

type MenuLabelsCardProps = {
    bot: BotSettings;
    busy: boolean;
    save: AdminSave;
};

const BUTTONS: readonly { key: keyof MenuLabels; label: string }[] = [
    { key: 'tickets', label: 'Кнопка списка обращений' },
    { key: 'help', label: 'Кнопка помощи' },
    { key: 'withdraw', label: 'Кнопка отзыва согласия' },
];

export function MenuLabelsCard({ bot, busy, save }: MenuLabelsCardProps) {
    return (
        <AdminCard title="Кнопки меню">
            <p className="admin-card__help">
                Кнопки под сообщениями бота. У клиентов в чате остаются старые кнопки, поэтому прежние названия
                продолжают работать.
            </p>

            <form
                className="settings-form"
                key={bot.version}
                onSubmit={(event) => {
                    event.preventDefault();
                    const form = new FormData(event.currentTarget);
                    const menu = Object.fromEntries(BUTTONS.map(({ key }) => [key, formText(form, key)]));

                    void save('/v1/admin/bot', {
                        method: 'PUT',
                        body: { policy_url: bot.policy_url, alternative_contact: bot.alternative_contact, menu },
                        version: bot.version,
                    });
                }}
            >
                {BUTTONS.map(({ key, label }) => (
                    <FormField key={key} label={label} hint={`Стандартно: «${bot.default_menu[key]}»`}>
                        <input name={key} defaultValue={bot.menu[key]} maxLength={40} required />
                    </FormField>
                ))}

                <Button className="settings-form__submit" type="submit" size="small" loading={busy}>
                    Сохранить
                </Button>
            </form>
        </AdminCard>
    );
}
