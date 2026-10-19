import { clsx } from 'clsx';

import { MEDIA, useMediaQuery } from '@/shared/lib/use-media-query';
import type { Presence } from '@/shared/types/routing';
import { Avatar, Icon } from '@/shared/ui';

type AccountGlyphProps = { name: string; presence: Presence; menu: boolean };

export function AccountGlyph({ name, presence, menu }: AccountGlyphProps) {
    const phone = useMediaQuery(MEDIA.phone);

    return (
        <span className="account-menu__glyph">
            <span className="account-menu__avatar">
                {menu ? <Icon name="menu" size={22} /> : <Avatar name={name} size={phone ? 24 : 28} />}
                <i className={clsx('account-menu__presence', `account-menu__presence--${presence}`)} />
            </span>
        </span>
    );
}
