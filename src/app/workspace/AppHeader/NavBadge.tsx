import { clsx } from 'clsx';

import type { NavItem } from './nav-items';

export function NavBadge({ item }: { item: NavItem }) {
    if (item.dot) {
        return (
            <span className="app-header__nav-dot">
                <span className="visually-hidden">, есть новые подсказки</span>
            </span>
        );
    }

    if (!item.count) {
        return null;
    }

    return (
        <span className={clsx('app-header__nav-count', item.alert && 'app-header__nav-count--alert')}>
            {item.count > 99 ? '99+' : item.count}
        </span>
    );
}
