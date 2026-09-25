import { AdminCard } from '@/features/admin/components/AdminCard/AdminCard';
import type { AuditEntry } from '@/features/admin/model/types';
import { formatDate } from '@/shared/lib/format-date';
import { Empty } from '@/shared/ui';

import './AuditTab.scss';

export function AuditTab({ items, timezone }: { items: AuditEntry[] | undefined; timezone: string }) {
    return (
        <AdminCard title="Журнал изменений">
            {items?.length ? (
                <div className="audit-list admin-card__list">
                    {items.map((item) => (
                        <div className="audit-list__item" key={item.id}>
                            <time className="audit-list__time">{formatDate(item.created_at, timezone)}</time>
                            <strong className="audit-list__action">{item.action}</strong>
                            <code className="audit-list__object">{item.object_id}</code>
                        </div>
                    ))}
                </div>
            ) : (
                <Empty title="Журнал пуст">Изменения сотрудников и настроек появятся здесь.</Empty>
            )}
        </AdminCard>
    );
}
