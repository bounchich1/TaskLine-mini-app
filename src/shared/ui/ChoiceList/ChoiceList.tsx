import { clsx } from 'clsx';

import { Icon } from '../Icon/Icon';

import './ChoiceList.scss';

type Choice = { value: string; title: string; note?: string };

type ChoiceListProps = {
    name: string;
    legend: string;
    options: readonly Choice[];
    value: string;
    onChange: (value: string) => void;
    columns?: boolean;
};

export function ChoiceList({ name, legend, options, value, onChange, columns = false }: ChoiceListProps) {
    return (
        <fieldset className={clsx('choice-list', columns && 'choice-list--columns')}>
            <legend className="choice-list__legend">{legend}</legend>

            {options.map((option) => (
                <label
                    key={option.value}
                    className={clsx('choice-list__item', option.value === value && 'choice-list__item--selected')}
                >
                    <input
                        type="radio"
                        name={name}
                        className="visually-hidden"
                        value={option.value}
                        checked={option.value === value}
                        onChange={() => {
                            onChange(option.value);
                        }}
                    />

                    <span className="choice-list__text">
                        <span className="choice-list__title">{option.title}</span>
                        {option.note ? <span className="choice-list__note">{option.note}</span> : null}
                    </span>

                    {option.value === value ? <Icon name="check" size={16} className="choice-list__check" /> : null}
                </label>
            ))}
        </fieldset>
    );
}
