import { useState } from 'react';

import {
    countUnread,
    useMarkNotificationRead,
    useMarkTicketRead,
    type NotificationsQuery,
} from '@/features/notifications/hooks/use-notifications';
import { groupNotifications, sectionsByDay, type NotificationGroup } from '@/features/notifications/model/groups';
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
    onOpenIncident: (id: string) => void;
};

export function NotificationsPage(props: NotificationsPageProps) {
    const { notifications, me, timezone, onOpenTicket, onOpenIncident } = props;
    const markRead = useMarkTicketRead();
    const markOneRead = useMarkNotificationRead();
    const now = useNow();
    const [settingsOpen, setSettingsOpen] = useState(false);
    const unread = countUnread(notifications);
    const sections = sectionsByDay(groupNotifications(notifications.data?.items ?? []), timezone, now);

    const open = ({ ticketId, latest }: NotificationGroup) => {
        if (ticketId) {
            markRead(ticketId);
            onOpenTicket(ticketId);
        } else if (latest.payload.incident_id) {
            markOneRead(latest.id);
            onOpenIncident(latest.payload.incident_id);
        }
    };

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
                                    key={group.key}
                                    group={group}
                                    me={me}
                                    now={now}
                                    timezone={timezone}
                                    onOpen={open}
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
