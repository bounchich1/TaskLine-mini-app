import { AdminCard } from '@/features/admin/components/AdminCard/AdminCard';
import { groupTemplates } from '@/features/admin/model/template-catalog';
import type { Template } from '@/features/admin/model/types';

import { TemplateRow } from './TemplateRow';

import './TemplatesTab.scss';

type TemplatesTabProps = {
    templates: Template[] | undefined;
    onEdit: (template: Template) => void;
};

export function TemplatesTab({ templates, onEdit }: TemplatesTabProps) {
    return (
        <AdminCard title="Сообщения бота">
            <p className="admin-card__help">
                Сообщения сгруппированы по пути клиента. В редакторе видно, как клиент увидит текст. Личные данные
                сотрудников клиентам не передаются.
            </p>

            {groupTemplates(templates ?? []).map((group) => (
                <div className="templates-tab__group" key={group.title}>
                    <h3 className="templates-tab__group-title">{group.title}</h3>

                    <div className="admin-card__list">
                        {group.items.map((template) => (
                            <TemplateRow
                                key={template.code}
                                template={template}
                                onEdit={() => {
                                    onEdit(template);
                                }}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </AdminCard>
    );
}
