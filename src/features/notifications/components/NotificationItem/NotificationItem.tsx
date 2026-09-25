import { clsx } from 'clsx';

import { notificationLabel } from '@/shared/config/labels';
import { formatDate } from '@/shared/lib/format-date';
import type { Notification } from '@/shared/types/api';
import { Icon, type IconName } from '@/shared/ui';

import './NotificationItem.scss';

const ICONS: Partial<Record<string, IconName>> = {
  'ticket.created': 'inbox',
  'message.from_client': 'send',
  'ticket.transferred': 'user',
  'rating.received': 'star',
};

type NotificationItemProps = {
  notification: Notification;
  timezone: string;
  onOpen: (notification: Notification) => void;
};

export function NotificationItem({ notification, timezone, onOpen }: NotificationItemProps) {
  const unread = !notification.read_at;
  return (
    <li>
      <button
        className={clsx('notification-item', unread && 'notification-item--unread')}
        onClick={() => {
          onOpen(notification);
        }}
      >
        <span className="notification-item__icon">
          <Icon name={ICONS[notification.type] ?? 'bell'} size={18} />
        </span>
        <span className="notification-item__title">
          {notificationLabel(notification.type)}
          {unread ? <span className="visually-hidden"> (не прочитано)</span> : null}
        </span>
        <time className="notification-item__time" dateTime={notification.created_at}>
          {formatDate(notification.created_at, timezone)}
        </time>
        <Icon className="notification-item__arrow" name="arrow" size={16} />
      </button>
    </li>
  );
}
