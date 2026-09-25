import {
  countUnread,
  useMarkNotificationRead,
  type NotificationsQuery,
} from '@/features/notifications/hooks/use-notifications';
import { Empty, ErrorNotice, PageHeader } from '@/shared/ui';

import { NotificationItem } from '../NotificationItem/NotificationItem';

import './NotificationsPage.scss';

type NotificationsPageProps = {
  notifications: NotificationsQuery;
  timezone: string;
  onOpenTicket: (id: string) => void;
};

export function NotificationsPage({
  notifications,
  timezone,
  onOpenTicket,
}: NotificationsPageProps) {
  const markRead = useMarkNotificationRead();
  const items = notifications.data?.items;
  const unread = countUnread(notifications);
  return (
    <div className="notifications-page">
      <PageHeader title="Уведомления">
        {unread > 0 ? (
          <span className="notifications-page__count">Не прочитано: {unread}</span>
        ) : null}
      </PageHeader>
      <ErrorNotice error={notifications.error} />
      {items?.length ? (
        <ul className="notifications-page__list">
          {items.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              timezone={timezone}
              onOpen={() => {
                markRead(notification.id);
                onOpenTicket(notification.ticket_id);
              }}
            />
          ))}
        </ul>
      ) : (
        <Empty title="Уведомлений нет">
          Здесь появятся новые обращения, сообщения клиентов, передачи и оценки.
        </Empty>
      )}
    </div>
  );
}
