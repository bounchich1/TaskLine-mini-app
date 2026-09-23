import { profileRoleLabel } from '@/shared/config/labels';
import type { Session } from '@/shared/types/api';
import { Avatar, Icon, type IconName } from '@/shared/ui';

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
        className="brand"
        href="#"
        onClick={(event) => {
          event.preventDefault();
          onSection('tickets');
        }}
      >
        <span className="brand-mark">
          <Icon name="inbox" size={23} />
        </span>
        <span>
          Линия<span className="brand-caption">поддержка в MAX</span>
        </span>
      </a>
      <div className="workspace-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>
      <nav aria-label="Основная навигация">
        {items.map((item) => (
          <button
            key={item.section}
            className={section === item.section ? 'nav-item active' : 'nav-item'}
            onClick={() => {
              onSection(item.section);
            }}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
            {item.count === undefined ? null : <span className="nav-count">{item.count}</span>}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="channel-card">
          <span className="online-dot" />
          <div>
            Канал поддержки<small>MAX Messenger</small>
          </div>
          <span className="channel-symbol">М</span>
        </div>
        <div className="profile">
          <Avatar>{employee.name[0]}</Avatar>
          <div>
            {employee.name}
            <small>{profileRoleLabel(employee.role)}</small>
          </div>
        </div>
      </div>
    </aside>
  );
}
