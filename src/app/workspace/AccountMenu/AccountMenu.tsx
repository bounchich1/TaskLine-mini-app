import { useId } from 'react';

import { roleLabel } from '@/shared/config/labels';
import { MEDIA, useMediaQuery } from '@/shared/lib/use-media-query';
import { usePopoverState } from '@/shared/lib/use-popover-state';
import type { Session } from '@/shared/types/api';
import { Avatar } from '@/shared/ui';

import { AccountPanel } from './AccountPanel';

import './AccountMenu.scss';

export function AccountMenu({ session }: { session: Session }) {
    const { open, root, trigger, close, toggle, onBlur } = usePopoverState();

    const panelId = useId();

    const phone = useMediaQuery(MEDIA.phone);

    const { name, role } = session.employee;

    return (
        <div ref={root} className="account-menu" onBlur={onBlur}>
            <button
                ref={trigger}
                type="button"
                className="account-menu__trigger"
                aria-label={`Профиль: ${name}`}
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-controls={open ? panelId : undefined}
                onClick={toggle}
            >
                <Avatar name={name} size={phone ? 24 : 28} />

                <span className="account-menu__text">
                    {name}
                    <small className="account-menu__role">{roleLabel(role)}</small>
                </span>

                <span className="account-menu__tab-label">Профиль</span>
            </button>

            {open ? <AccountPanel id={panelId} session={session} anchor={root} onClose={close} /> : null}
        </div>
    );
}
