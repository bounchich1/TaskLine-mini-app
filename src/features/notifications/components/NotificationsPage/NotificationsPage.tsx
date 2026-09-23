import {
  useMarkNotificationRead,
  type NotificationsQuery,
} from '@/features/notifications/hooks/use-notifications';
import { Empty, ErrorNotice, PageHeading } from '@/shared/ui';

import { NotificationItem } from '../NotificationItem/NotificationItem';

type NotificationsPageProps = {
  notifications: NotificationsQuery;
  timezone: string;
  onOpenTicket: (id: string) => void;
};

/** Team events addressed to the employee: new tickets and messages, transfers, ratings. */
export function NotificationsPage({
  notifications,
  timezone,
  onOpenTicket,
}: NotificationsPageProps) {
  const markRead = useMarkNotificationRead();
  const items = notifications.data?.items;
  return (
    <>
      <PageHeading eyebrow="СОБЫТИЯ КОМАНДЫ" title="Уведомления" />
      <ErrorNotice error={notifications.error} />
      <section className="notification-list">
        {items?.length ? (
          items.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              timezone={timezone}
              onOpen={() => {
                markRead(notification.id);
                onOpenTicket(notification.ticket_id);
              }}
            />
          ))
        ) : (
          <Empty title="Вы в курсе всех событий">Новые сообщения и оценки появятся здесь.</Empty>
        )}
      </section>
    </>
  );
}
