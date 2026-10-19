import { clsx } from 'clsx';
import { useId, useState } from 'react';

import { MacroManager, presenceLabel, ShiftEndDialog, usePresence } from '@/features/routing';
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
    const presence = usePresence(session);
    const [macros, setMacros] = useState(false);

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
                <span className="account-menu__avatar">
                    <Avatar name={name} size={phone ? 24 : 28} />
                    <i className={clsx('account-menu__presence', `account-menu__presence--${presence.presence}`)} />
                </span>

                <span className="account-menu__text">
                    {name}

                    <small className="account-menu__role">
                        {roleLabel(role)} · {presenceLabel(presence.presence)}
                    </small>
                </span>

                <span className="account-menu__tab-label">Профиль</span>
            </button>

            {open ? (
                <AccountPanel
                    id={panelId}
                    session={session}
                    presence={presence}
                    anchor={root}
                    onClose={close}
                    onMacros={() => {
                        close();
                        setMacros(true);
                    }}
                />
            ) : null}

            {presence.active > 0 ? <ShiftEndDialog state={presence} /> : null}

            {macros ? (
                <MacroManager
                    employeeId={session.employee.id}
                    onClose={() => {
                        setMacros(false);
                    }}
                />
            ) : null}
        </div>
    );
}
