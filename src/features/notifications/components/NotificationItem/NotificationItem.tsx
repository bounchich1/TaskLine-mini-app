import { clsx } from 'clsx';

import type { NotificationGroup } from '@/features/notifications/model/groups';
import {
    earlierSummary,
    isStale,
    notificationDetail,
    notificationIcon,
    notificationTitle,
    notificationTone,
} from '@/features/notifications/model/notification-copy';
import { formatDate, formatTimeAgo } from '@/shared/lib/format-date';
import { Icon } from '@/shared/ui';

import { NotificationTicketLines } from './NotificationTicketLines';

import './NotificationItem.scss';

type NotificationItemProps = {
    group: NotificationGroup;
    me: string;
    now: number;
    timezone: string;
    onOpen: (group: NotificationGroup) => void;
};

export function NotificationItem({ group, me, now, timezone, onOpen }: NotificationItemProps) {
    const { latest, earlier, unread } = group;
    const { ticket } = latest;

    return (
        <li>
            <button
                className={clsx(
                    'notification-item',
                    unread > 0 && 'notification-item--unread',
                    isStale(latest, me) && 'notification-item--stale',
                )}
                disabled={!ticket && !latest.payload.incident_id}
                onClick={() => {
                    onOpen(group);
                }}
            >
                <span
                    className={clsx('notification-item__icon', `notification-item__icon--${notificationTone(latest)}`)}
                >
                    <Icon name={notificationIcon(latest)} size={18} />
                </span>

                <span className="notification-item__body">
                    <span className="notification-item__head">
                        <span className="notification-item__title">
                            {notificationTitle(latest)}
                            {unread > 0 ? <span className="visually-hidden"> (не прочитано)</span> : null}
                        </span>

                        <time
                            className="notification-item__time"
                            dateTime={latest.created_at}
                            title={formatDate(latest.created_at, timezone)}
                        >
                            {formatTimeAgo(latest.created_at, timezone, now)}
                        </time>
                    </span>

                    <NotificationTicketLines
                        ticket={ticket}
                        detail={notificationDetail(latest)}
                        earlier={earlierSummary(earlier)}
                        me={me}
                        timezone={timezone}
                    />
                </span>

                {unread > 1 ? (
                    <span className="notification-item__count" aria-label={`Непрочитанных: ${unread}`}>
                        {unread}
                    </span>
                ) : null}
            </button>
        </li>
    );
}
