import { clsx } from 'clsx';
import { useId, useRef } from 'react';

import { Icon } from '../Icon/Icon';

import { SelectList } from './SelectList';
import { optionId, useSelect, type SelectOption } from './use-select';

import './Select.scss';

export type SelectProps = {
    options: readonly SelectOption[];
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    name?: string;
    placeholder?: string;
    disabled?: boolean;
    appearance?: 'field' | 'plain';
    size?: 'medium' | 'large';
    className?: string;
    'aria-label'?: string;
};

export function Select(props: SelectProps) {
    const { options, name, placeholder, disabled, appearance = 'field', size = 'medium' } = props;
    const label = props['aria-label'];
    const select = useSelect(options, props);
    const rootRef = useRef<HTMLDivElement>(null);
    const listId = useId();
    const chosen = options.at(select.selected);

    return (
        <div ref={rootRef} className={clsx('select', `select--${appearance}`, `select--${size}`, props.className)}>
            <button
                type="button"
                role="combobox"
                className="select__trigger"
                aria-label={label}
                aria-haspopup="listbox"
                aria-expanded={select.open}
                aria-controls={select.open ? listId : undefined}
                aria-activedescendant={select.open ? optionId(listId, select.active) : undefined}
                disabled={disabled}
                onClick={select.toggle}
                onKeyDown={select.onKeyDown}
            >
                <span className={clsx('select__value', !chosen && 'select__value--placeholder')}>
                    {chosen ? chosen.label : placeholder}
                    {chosen?.note ? <span className="select__note"> · {chosen.note}</span> : null}
                </span>

                <Icon name="chevron" size={16} className="select__chevron" />
            </button>

            {name === undefined ? null : <input type="hidden" name={name} value={select.value} />}

            {select.open ? (
                <SelectList
                    id={listId}
                    options={options}
                    active={select.active}
                    selected={select.selected}
                    anchor={rootRef}
                    label={label}
                    onHighlight={select.highlight}
                    onChoose={select.choose}
                    onClose={select.close}
                />
            ) : null}
        </div>
    );
}
