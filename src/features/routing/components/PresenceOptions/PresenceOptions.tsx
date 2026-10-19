import { clsx } from 'clsx';

import type { PresenceState } from '@/features/routing/hooks/use-presence';
import { PRESENCE_OPTIONS } from '@/features/routing/model/presence';
import { ErrorNotice, Icon } from '@/shared/ui';

import './PresenceOptions.scss';

type PresenceOptionsProps = { state: PresenceState };

export function PresenceOptions({ state }: PresenceOptionsProps) {
    return (
        <fieldset className="presence-options">
            <legend className="presence-options__legend">Статус</legend>

            {PRESENCE_OPTIONS.map((option) => (
                <label
                    key={option.value}
                    className={clsx(
                        'presence-options__option',
                        option.value === state.presence && 'presence-options__option--selected',
                    )}
                >
                    <input
                        type="radio"
                        name="presence"
                        className="visually-hidden"
                        value={option.value}
                        checked={option.value === state.presence}
                        disabled={state.change.isPending}
                        onChange={() => {
                            state.change.mutate(option.value);
                        }}
                    />

                    <i className={clsx('presence-dot', `presence-dot--${option.value}`)} aria-hidden />

                    <span className="presence-options__text">
                        {option.label}
                        <small className="presence-options__hint">{option.hint}</small>
                    </span>

                    {option.value === state.presence ? <Icon name="check" size={16} /> : null}
                </label>
            ))}

            <ErrorNotice error={state.change.error} />
        </fieldset>
    );
}
