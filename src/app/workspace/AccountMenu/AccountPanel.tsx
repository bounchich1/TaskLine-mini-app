import { clsx } from 'clsx';
import { useEffect, useRef, type RefObject } from 'react';

import { roleLabel } from '@/shared/config/labels';
import { setSchemePreference, useSchemePreference, type SchemePreference } from '@/shared/lib/color-scheme';
import { useAnchoredPopover } from '@/shared/lib/use-anchored-popover';
import type { Session } from '@/shared/types/api';
import { Avatar, Icon, type IconName } from '@/shared/ui';

type AccountPanelProps = {
    id: string;
    session: Session;
    anchor: RefObject<HTMLElement | null>;
    onClose: () => void;
};

const SCHEMES: { value: SchemePreference; label: string; icon: IconName }[] = [
    { value: 'system', label: 'Как на устройстве', icon: 'contrast' },
    { value: 'light', label: 'Светлая', icon: 'sun' },
    { value: 'dark', label: 'Тёмная', icon: 'moon' },
];

export function AccountPanel({ id, session, anchor, onClose }: AccountPanelProps) {
    const ref = useRef<HTMLDivElement>(null);
    const preference = useSchemePreference();

    useAnchoredPopover({ anchor, popover: ref, onClose, align: 'end' });

    useEffect(() => {
        ref.current?.querySelector<HTMLElement>('input:checked')?.focus();
    }, []);

    return (
        <div
            ref={ref}
            id={id}
            role="dialog"
            aria-label="Профиль"
            popover="manual"
            tabIndex={-1}
            className="account-panel"
        >
            <div className="account-panel__who">
                <Avatar name={session.employee.name} size={36} />

                <span className="account-panel__name">
                    {session.employee.name}
                    <small className="account-panel__role">{roleLabel(session.employee.role)}</small>
                </span>
            </div>

            <fieldset className="account-panel__schemes">
                <legend className="account-panel__legend">Тема</legend>

                {SCHEMES.map((scheme) => (
                    <label
                        key={scheme.value}
                        className={clsx(
                            'account-panel__scheme',
                            scheme.value === preference && 'account-panel__scheme--selected',
                        )}
                    >
                        <input
                            type="radio"
                            name="color-scheme"
                            className="visually-hidden"
                            value={scheme.value}
                            checked={scheme.value === preference}
                            onChange={() => {
                                setSchemePreference(scheme.value);
                            }}
                        />

                        <Icon name={scheme.icon} size={18} className="account-panel__scheme-icon" />
                        <span className="account-panel__scheme-label">{scheme.label}</span>
                        {scheme.value === preference ? <Icon name="check" size={16} /> : null}
                    </label>
                ))}
            </fieldset>
        </div>
    );
}
