import { notificationLabel } from '@/shared/config/labels';
import { formatDate } from '@/shared/lib/format-date';
import type { Notification } from '@/shared/types/api';
import { Icon } from '@/shared/ui';

type NotificationItemProps = {
  notification: Notification;
  timezone: string;
  onOpen: (notification: Notification) => void;
};

/** One notification; opening it marks it read and shows its ticket. */
export function NotificationItem({ notification, timezone, onOpen }: NotificationItemProps) {
  return (
    <button
      className={`notification ${notification.read_at ? 'read' : ''}`}
      onClick={() => {
        onOpen(notification);
      }}
    >
      <span className="notification-icon">
        <Icon name={notification.type === 'rating.received' ? 'check' : 'inbox'} />
      </span>
      <span>
        <strong>{notificationLabel(notification.type)}</strong>
        <small>{formatDate(notification.created_at, timezone)}</small>
      </span>
      <Icon name="arrow" size={16} />
    </button>
  );
}
