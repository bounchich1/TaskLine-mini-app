import { Button } from '@maxhub/max-ui';

import type { AdminSave } from '@/features/admin/hooks/use-admin-save';
import type { OrganizationSettings } from '@/features/admin/model/types';

type SettingsTabProps = {
  settings: OrganizationSettings;
  busy: boolean;
  save: AdminSave;
};

/** Organization name and timezone. */
export function SettingsTab({ settings, busy, save }: SettingsTabProps) {
  return (
    <section className="admin-card">
      <h2>Организация</h2>
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
        <label className="form-field">
          Название
          <input name="name" defaultValue={settings.name} maxLength={120} required />
        </label>
        <label className="form-field">
          Часовой пояс
          <input name="timezone" defaultValue={settings.timezone} required />
        </label>
        <p className="admin-help">
          Политика согласия, ключи сервисов и ограничения ИИ настраиваются при развёртывании
          сервера.
        </p>
        <Button type="submit" loading={busy}>
          Сохранить
        </Button>
      </form>
    </section>
  );
}
