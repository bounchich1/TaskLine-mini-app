import { clsx } from 'clsx';
import type { CSSProperties } from 'react';

import type { ConnectionState } from '@/shared/api/events-stream';
import { MEDIA, useMediaQuery } from '@/shared/lib/use-media-query';
import type { Session } from '@/shared/types/api';
import { Icon } from '@/shared/ui';

import { AccountMenu } from '../AccountMenu/AccountMenu';
import { ConnectionStatus } from '../ConnectionStatus/ConnectionStatus';

import { navItems, type IncidentBadge, type Section } from './nav-items';
import { NavBadge } from './NavBadge';

import './AppHeader.scss';

export type { Section };

type AppHeaderProps = {
    session: Session;
    section: Section;
    onSection: (section: Section) => void;
    unread: number;
    incidents: IncidentBadge | undefined;
    connection: ConnectionState;
};

export function AppHeader(props: AppHeaderProps) {
    const { session, section, onSection, connection } = props;
    const phone = useMediaQuery(MEDIA.phone);
    const items = navItems(session, props.unread, props.incidents);
    const tabs = phone ? items.filter((item) => item.section !== 'admin') : items;

    const more =
        tabs.length < items.length
            ? {
                  active: section === 'admin',
                  onOpen: () => {
                      onSection('admin');
                  },
              }
            : undefined;

    return (
        <header className="app-header">
            <span className="app-header__org">{session.organization.name}</span>

            <nav
                className="app-header__nav"
                aria-label="Основная навигация"
                style={{ '--nav-items': tabs.length } as CSSProperties}
            >
                {tabs.map((item) => (
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
                        <span className="app-header__nav-glyph">
                            <Icon name={item.icon} size={22} />
                        </span>

                        <span className="app-header__nav-label">{item.label}</span>
                        <NavBadge item={item} />
                    </button>
                ))}
            </nav>

            <ConnectionStatus className="app-header__connection" connection={connection} />
            <AccountMenu session={session} connection={phone ? connection : undefined} admin={more} />
        </header>
    );
}
