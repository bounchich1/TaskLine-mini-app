import { clsx } from 'clsx';
import type { CSSProperties } from 'react';

import { adminTabsFor } from '@/features/admin';
import type { ConnectionState } from '@/shared/api/events-stream';
import type { Session } from '@/shared/types/api';
import { Icon, type IconName } from '@/shared/ui';

import { AccountMenu } from '../AccountMenu/AccountMenu';

import './AppHeader.scss';

export type Section = 'tickets' | 'notifications' | 'admin';

type AppHeaderProps = {
    session: Session;
    section: Section;
    onSection: (section: Section) => void;
    openCount: number | undefined;
    unread: number;
    connection: ConnectionState;
};

type NavItem = { section: Section; icon: IconName; label: string; count?: number; alert?: boolean };

export function AppHeader(props: AppHeaderProps) {
    const { session, section, onSection, connection } = props;

    const items: NavItem[] = [
        { section: 'tickets', icon: 'inbox', label: 'Обращения', count: props.openCount },
        {
            section: 'notifications',
            icon: 'bell',
            label: 'Уведомления',
            count: props.unread,
            alert: true,
        },
    ];

    if (adminTabsFor(session).length > 0) {
        items.push({ section: 'admin', icon: 'settings', label: 'Управление' });
    }

    return (
        <header className="app-header">
            <span className="app-header__org">{session.organization.name}</span>

            <nav
                className="app-header__nav"
                aria-label="Основная навигация"
                style={{ '--nav-items': items.length } as CSSProperties}
            >
                {items.map((item) => (
                    <button
                        key={item.section}
                        className={clsx(
                            'app-header__nav-item',
                            section === item.section && 'app-header__nav-item--active',
                        )}
                        aria-current={section === item.section ? 'page' : undefined}
                        onClick={() => {
                            onSection(item.section);
                        }}
                    >
                        <Icon className="app-header__nav-icon" name={item.icon} size={20} />
                        <span className="app-header__nav-label">{item.label}</span>

                        {item.count ? (
                            <span
                                className={clsx('app-header__nav-count', item.alert && 'app-header__nav-count--alert')}
                            >
                                {item.count}
                            </span>
                        ) : null}
                    </button>
                ))}
            </nav>

            <span
                className={clsx('app-header__connection', `app-header__connection--${connection}`)}
                title={connection === 'live' ? 'Обновляется в реальном времени' : undefined}
            >
                <i className="app-header__connection-dot" />

                <span className="app-header__connection-text">
                    {connection === 'live' ? 'В сети' : 'Нет связи, обновляем раз в 15 с'}
                </span>
            </span>

            <AccountMenu session={session} />
        </header>
    );
}
