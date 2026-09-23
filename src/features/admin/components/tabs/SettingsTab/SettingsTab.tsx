import { Button } from '@maxhub/max-ui';

import { AdminCard } from '@/features/admin/components/AdminCard/AdminCard';
import type { AdminSave } from '@/features/admin/hooks/use-admin-save';
import type { OrganizationSettings } from '@/features/admin/model/types';
import { FormField } from '@/shared/ui';

import './SettingsTab.scss';

type SettingsTabProps = {
  settings: OrganizationSettings;
  busy: boolean;
  save: AdminSave;
};

/** Organization name and timezone. */
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
            body: { name: form.get('name'), timezone: form.get('timezone') },
            version: settings.version,
          });
        }}
      >
        <FormField label="Название">
          <input name="name" defaultValue={settings.name} maxLength={120} required />
        </FormField>
        <FormField label="Часовой пояс">
          <input name="timezone" defaultValue={settings.timezone} required />
        </FormField>
        <p className="admin-card__help">
          Политика согласия, ключи сервисов и ограничения ИИ настраиваются при развёртывании
          сервера.
        </p>
        <Button type="submit" loading={busy}>
          Сохранить
        </Button>
      </form>
    </AdminCard>
  );
}
