import { clsx } from 'clsx';
import { useId, useState } from 'react';

import { MacroManager, presenceLabel, ShiftEndDialog, usePresence } from '@/features/routing';
import type { ConnectionState } from '@/shared/api/events-stream';
import { roleLabel } from '@/shared/config/labels';
import { usePopoverState } from '@/shared/lib/use-popover-state';
import type { Session } from '@/shared/types/api';

import { AccountGlyph } from './AccountGlyph';
import { AccountPanel } from './AccountPanel';
import type { AdminLink } from './AdminLink';

import './AccountMenu.scss';

type AccountMenuProps = { session: Session; connection?: ConnectionState; admin?: AdminLink };

function closing(link: AdminLink | undefined, close: () => void): AdminLink | undefined {
    if (!link) {
        return undefined;
    }

    return {
        active: link.active,
        onOpen: () => {
            close();
            link.onOpen();
        },
    };
}

export function AccountMenu({ session, connection, admin }: AccountMenuProps) {
    const { open, root, trigger, close, toggle, onBlur } = usePopoverState();

    const panelId = useId();

    const { name, role } = session.employee;
    const presence = usePresence(session);
    const [macros, setMacros] = useState(false);
    const title = admin ? 'Ещё' : 'Профиль';
    const current = admin?.active === true;

    return (
        <div ref={root} className="account-menu" onBlur={onBlur}>
            <button
                ref={trigger}
                type="button"
                className={clsx('account-menu__trigger', current && 'account-menu__trigger--active')}
                aria-label={admin ? title : `Профиль: ${name}`}
                aria-current={current ? 'page' : undefined}
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-controls={open ? panelId : undefined}
                onClick={toggle}
            >
                <AccountGlyph name={name} presence={presence.presence} menu={Boolean(admin)} />

                <span className="account-menu__text">
                    {name}

                    <small className="account-menu__role">
                        {roleLabel(role)} · {presenceLabel(presence.presence)}
                    </small>
                </span>

                <span className="account-menu__tab-label">{title}</span>
            </button>

            {open ? (
                <AccountPanel
                    id={panelId}
                    title={title}
                    session={session}
                    connection={connection}
                    admin={closing(admin, close)}
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
