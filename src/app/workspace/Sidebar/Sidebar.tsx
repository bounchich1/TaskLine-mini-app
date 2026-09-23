import { clsx } from 'clsx';

import { profileRoleLabel } from '@/shared/config/labels';
import type { Session } from '@/shared/types/api';
import { Avatar, Icon, type IconName } from '@/shared/ui';

import './Sidebar.scss';

export type Section = 'tickets' | 'notifications' | 'admin';

type SidebarProps = {
  session: Session;
  section: Section;
  onSection: (section: Section) => void;
  /** Open tickets, or undefined while the queue loads. */
  openCount: number | undefined;
  unread: number;
};

type NavItem = { section: Section; icon: IconName; label: string; count?: number | string };

/** Brand, section navigation, the support channel and the signed-in employee. */
export function Sidebar({ session, section, onSection, openCount, unread }: SidebarProps) {
  const { capabilities, employee } = session;
  const items: NavItem[] = [
    { section: 'tickets', icon: 'inbox', label: 'Обращения', count: openCount ?? '—' },
    {
      section: 'notifications',
      icon: 'bell',
      label: 'Уведомления',
      count: unread > 0 ? unread : undefined,
    },
  ];
  if (capabilities.admin || capabilities.operations) {
    items.push({ section: 'admin', icon: 'settings', label: 'Управление' });
  }
  return (
    <aside className="sidebar">
      {/* Kept a link (not a button) so it looks and behaves as before; it opens the queue. */}
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a
        className="sidebar__brand"
        href="#"
        onClick={(event) => {
          event.preventDefault();
          onSection('tickets');
        }}
      >
        <span className="sidebar__brand-mark">
          <Icon name="inbox" size={23} />
        </span>
        <span className="sidebar__brand-name">
          Линия<span className="sidebar__brand-caption">поддержка в MAX</span>
        </span>
      </a>
      <div className="sidebar__label">РАБОЧЕЕ ПРОСТРАНСТВО</div>
      <nav className="sidebar__nav" aria-label="Основная навигация">
        {items.map((item) => (
          <button
            key={item.section}
            className={clsx(
              'sidebar__nav-item',
              section === item.section && 'sidebar__nav-item--active',
            )}
            onClick={() => {
              onSection(item.section);
            }}
          >
            <Icon className="sidebar__nav-icon" name={item.icon} />
            <span className="sidebar__nav-label">{item.label}</span>
            {item.count === undefined ? null : (
              <span className="sidebar__nav-count">{item.count}</span>
            )}
          </button>
        ))}
      </nav>
      <div className="sidebar__bottom">
        <div className="sidebar__channel">
          <span className="sidebar__online-dot" />
          <div>
            Канал поддержки<small className="sidebar__channel-caption">MAX Messenger</small>
          </div>
          <span className="sidebar__channel-symbol">М</span>
        </div>
        <div className="sidebar__profile">
          <Avatar>{employee.name[0]}</Avatar>
          <div>
            {employee.name}
            <small className="sidebar__profile-role">{profileRoleLabel(employee.role)}</small>
          </div>
        </div>
      </div>
    </aside>
  );
}
