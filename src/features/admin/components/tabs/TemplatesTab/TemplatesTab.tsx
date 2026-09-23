import { Button } from '@maxhub/max-ui';

import type { Template } from '@/features/admin/model/types';

type TemplatesTabProps = {
  templates: Template[] | undefined;
  onEdit: (template: Template) => void;
};

/** The bot's messages to clients. */
export function TemplatesTab({ templates, onEdit }: TemplatesTabProps) {
  return (
    <section className="admin-card">
      <div className="admin-card-head">
        <h2>Сообщения бота</h2>
      </div>
      <p className="admin-help">
        Подстановки: {'{ticket_number}'}, {'{policy_url}'}, {'{alternative_contact}'}. Личные данные
        сотрудников клиентам не передаются.
      </p>
      {templates?.map((item) => (
        <div className="template-row" key={item.code}>
          <div>
            <strong>{item.code}</strong>
            <small>Версия {item.version}</small>
            <p>{item.body}</p>
          </div>
          <Button
            variant="ghost"
            size="small"
            onClick={() => {
              onEdit(item);
            }}
          >
            Изменить
          </Button>
        </div>
      ))}
    </section>
  );
}
