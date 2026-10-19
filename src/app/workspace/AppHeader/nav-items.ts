import { adminTabsFor } from '@/features/admin';
import { can } from '@/shared/lib/access';
import type { Session } from '@/shared/types/api';
import type { IconName } from '@/shared/ui';

export type Section = 'tickets' | 'notifications' | 'incidents' | 'reports' | 'admin';

export type IncidentBadge = { active: number; suggested: number };

export type NavItem = {
    section: Section;
    icon: IconName;
    label: string;
    count?: number;
    alert?: boolean;
    dot?: boolean;
};

export function navItems(session: Session, unread: number, incidents: IncidentBadge | undefined): NavItem[] {
    const items: NavItem[] = [
        { section: 'tickets', icon: 'inbox', label: 'Обращения' },
        { section: 'notifications', icon: 'bell', label: 'Уведомления', count: unread, alert: true },
    ];

    if (can(session, 'incidents.manage')) {
        const suggested = Boolean(incidents?.suggested);

        items.push({
            section: 'incidents',
            icon: 'zap',
            label: 'Инциденты',
            count: suggested ? undefined : incidents?.active,
            dot: suggested,
        });
    }

    if (can(session, 'reports.view')) {
        items.push({ section: 'reports', icon: 'chart', label: 'Отчёты' });
    }

    if (adminTabsFor(session).length > 0) {
        items.push({ section: 'admin', icon: 'settings', label: 'Управление' });
    }

    return items;
}
