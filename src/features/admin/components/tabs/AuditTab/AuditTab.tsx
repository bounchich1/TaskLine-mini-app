import type { AuditEntry } from '@/features/admin/model/types';
import { formatDate } from '@/shared/lib/format-date';
import { Empty } from '@/shared/ui';

/** Changes made by employees and administrators. */
export function AuditTab({
  items,
  timezone,
}: {
  items: AuditEntry[] | undefined;
  timezone: string;
}) {
  return (
    <section className="admin-card">
      <h2>Журнал изменений</h2>
      {items?.length ? (
        <div className="audit-list">
          {items.map((item) => (
            <div key={item.id}>
              <time>{formatDate(item.created_at, timezone)}</time>
              <strong>{item.action}</strong>
              <code>{item.object_id}</code>
            </div>
          ))}
        </div>
      ) : (
        <Empty title="Журнал пуст">Изменения сотрудников и настроек появятся здесь.</Empty>
      )}
    </section>
  );
}
