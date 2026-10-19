import { clsx } from 'clsx';

import { Icon } from '@/shared/ui';

export type AdminLink = { active: boolean; onOpen: () => void };

export function AdminLinkRow({ link }: { link: AdminLink }) {
    return (
        <button
            type="button"
            className={clsx('account-panel__link', link.active && 'account-panel__link--active')}
            aria-current={link.active ? 'page' : undefined}
            onClick={link.onOpen}
        >
            <Icon name="settings" size={18} className="account-panel__link-icon" />
            <span className="account-panel__link-label">Управление</span>
            <Icon name="arrow" size={16} className="account-panel__link-icon" />
        </button>
    );
}
