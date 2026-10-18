import { useState } from 'react';

import {
    countUnread,
    useMarkTicketRead,
    type NotificationsQuery,
} from '@/features/notifications/hooks/use-notifications';
import { groupNotifications, sectionsByDay } from '@/features/notifications/model/groups';
import { plural } from '@/shared/lib/plural';
import { useNow } from '@/shared/lib/use-now';
import { Empty, ErrorNotice, Icon, PageHeader } from '@/shared/ui';

import { NotificationItem } from '../NotificationItem/NotificationItem';
import { NotificationSettingsDialog } from '../NotificationSettingsDialog/NotificationSettingsDialog';

import './NotificationsPage.scss';

type NotificationsPageProps = {
    notifications: NotificationsQuery;
    me: string;
    timezone: string;
    onOpenTicket: (id: string) => void;
};

export function NotificationsPage({ notifications, me, timezone, onOpenTicket }: NotificationsPageProps) {
    const markRead = useMarkTicketRead();
    const now = useNow();
    const [settingsOpen, setSettingsOpen] = useState(false);
    const unread = countUnread(notifications);
    const sections = sectionsByDay(groupNotifications(notifications.data?.items ?? []), timezone, now);

    return (
        <div className="notifications-page">
            <PageHeader
                title="Уведомления"
                actions={
                    <button
                        className="notifications-page__settings"
                        aria-label="Настройки уведомлений"
                        title="Настройки уведомлений"
                        onClick={() => {
                            setSettingsOpen(true);
                        }}
                    >
                        <Icon name="settings" size={18} />
                    </button>
                }
            >
                {unread > 0 ? (
                    <span className="notifications-page__count">
                        Новое в {unread} {plural(unread, ['обращении', 'обращениях', 'обращениях'])}
                    </span>
                ) : null}
            </PageHeader>

            <ErrorNotice error={notifications.error} />

            {sections.length ? (
                sections.map((section) => (
                    <section className="notifications-page__day" key={section.key} aria-label={section.title}>
                        <h2 className="notifications-page__day-title">{section.title}</h2>

                        <ul className="notifications-page__list">
                            {section.groups.map((group) => (
                                <NotificationItem
                                    key={group.ticketId}
                                    group={group}
                                    me={me}
                                    now={now}
                                    timezone={timezone}
                                    onOpen={(ticketId) => {
                                        markRead(ticketId);
                                        onOpenTicket(ticketId);
                                    }}
                                />
                            ))}
                        </ul>
                    </section>
                ))
            ) : (
                <Empty title="Уведомлений нет">
                    Здесь появятся новые обращения, сообщения клиентов, передачи, оценки и предупреждения о сроках.
                </Empty>
            )}

            {settingsOpen ? (
                <NotificationSettingsDialog
                    onClose={() => {
                        setSettingsOpen(false);
                    }}
                />
            ) : null}
        </div>
    );
}
