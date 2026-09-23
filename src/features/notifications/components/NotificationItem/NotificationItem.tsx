import { clsx } from 'clsx';

import { notificationLabel } from '@/shared/config/labels';
import { formatDate } from '@/shared/lib/format-date';
import type { Notification } from '@/shared/types/api';
import { Icon } from '@/shared/ui';

import './NotificationItem.scss';

type NotificationItemProps = {
  notification: Notification;
  timezone: string;
  onOpen: (notification: Notification) => void;
};

/** One notification; opening it marks it read and shows its ticket. */
export function NotificationItem({ notification, timezone, onOpen }: NotificationItemProps) {
  return (
    <button
      className={clsx('notification-item', notification.read_at && 'notification-item--read')}
      onClick={() => {
        onOpen(notification);
      }}
    >
      <span className="notification-item__icon">
        <Icon name={notification.type === 'rating.received' ? 'check' : 'inbox'} />
      </span>
      <span className="notification-item__content">
        <strong className="notification-item__title">{notificationLabel(notification.type)}</strong>
        <small className="notification-item__time">
          {formatDate(notification.created_at, timezone)}
        </small>
      </span>
      <Icon className="notification-item__arrow" name="arrow" size={16} />
    </button>
  );
}
