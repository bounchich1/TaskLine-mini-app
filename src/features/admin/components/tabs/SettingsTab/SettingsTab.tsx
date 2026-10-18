import { Button } from '@maxhub/max-ui';

import { AdminCard } from '@/features/admin/components/AdminCard/AdminCard';
import type { AdminSave } from '@/features/admin/hooks/use-admin-save';
import { timezoneOptions } from '@/features/admin/model/timezones';
import type { OrganizationSettings } from '@/features/admin/model/types';
import { FormField, Select } from '@/shared/ui';

import './SettingsTab.scss';

type SettingsTabProps = {
    settings: OrganizationSettings;
    busy: boolean;
    save: AdminSave;
};

const TICKET_RETENTION_HINT =
    'От 30 до 3650. Пусто — бессрочно. Потом переписка и файлы стираются, остаются номер, тема и оценка.';

function days(value: FormDataEntryValue | null): number | null {
    const text = typeof value === 'string' ? value.trim() : '';

    return text ? Number(text) : null;
}

export function SettingsTab({ settings, busy, save }: SettingsTabProps) {
    return (
        <AdminCard title="Организация">
            <form
                className="settings-form"
                key={settings.version}
                onSubmit={(event) => {
                    event.preventDefault();
                    const form = new FormData(event.currentTarget);

                    void save('/v1/admin/settings', {
                        method: 'PUT',
                        body: {
                            name: form.get('name'),
                            timezone: form.get('timezone'),
                            retention: {
                                closed_ticket_days: days(form.get('closed_ticket_days')),
                                audit_days: days(form.get('audit_days')),
                            },
                        },
                        version: settings.version,
                    });
                }}
            >
                <FormField label="Название">
                    <input name="name" defaultValue={settings.name} maxLength={120} required />
                </FormField>

                <FormField label="Часовой пояс" hint="По нему считаются рабочие часы и сроки ответа.">
                    <Select
                        name="timezone"
                        options={timezoneOptions(settings.timezone)}
                        defaultValue={settings.timezone}
                        aria-label="Часовой пояс"
                    />
                </FormField>

                <FormField label="Хранить закрытые обращения, дней" hint={TICKET_RETENTION_HINT}>
                    <input
                        name="closed_ticket_days"
                        type="number"
                        inputMode="numeric"
                        min={30}
                        max={3650}
                        defaultValue={settings.retention.closed_ticket_days ?? ''}
                    />
                </FormField>

                <FormField label="Хранить журнал аудита, дней" hint="От 365 до 3650. Пусто — бессрочно.">
                    <input
                        name="audit_days"
                        type="number"
                        inputMode="numeric"
                        min={365}
                        max={3650}
                        defaultValue={settings.retention.audit_days ?? ''}
                    />
                </FormField>

                <p className="admin-card__help">
                    Ключи сервисов и ограничения ИИ настраиваются при развёртывании сервера.
                </p>

                <Button className="settings-form__submit" type="submit" size="small" loading={busy}>
                    Сохранить
                </Button>
            </form>
        </AdminCard>
    );
}
