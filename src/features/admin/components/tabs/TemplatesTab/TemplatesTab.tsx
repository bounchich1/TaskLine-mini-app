import { Button } from '@maxhub/max-ui';

import { AdminCard } from '@/features/admin/components/AdminCard/AdminCard';
import type { Template } from '@/features/admin/model/types';

import './TemplatesTab.scss';

type TemplatesTabProps = {
  templates: Template[] | undefined;
  onEdit: (template: Template) => void;
};

/** The bot's messages to clients. */
export function TemplatesTab({ templates, onEdit }: TemplatesTabProps) {
  return (
    <AdminCard title="Сообщения бота">
      <p className="admin-card__help">
        Подстановки: {'{ticket_number}'}, {'{policy_url}'}, {'{alternative_contact}'}. Личные данные
        сотрудников клиентам не передаются.
      </p>
      <div className="admin-card__list">
        {templates?.map((item) => (
          <div className="template-row" key={item.code}>
            <div className="template-row__main">
              <code className="template-row__code">{item.code}</code>
              <small className="template-row__version">Версия {item.version}</small>
              <p className="template-row__body">{item.body}</p>
            </div>
            <Button
              variant="secondary"
              size="xsmall"
              onClick={() => {
                onEdit(item);
              }}
            >
              Изменить
            </Button>
          </div>
        ))}
      </div>
    </AdminCard>
  );
}
