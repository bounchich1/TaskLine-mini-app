import { DatePicker, FormField } from '@/shared/ui';

import './EtaFields.scss';

const TIME_PATTERN = '(?:[01]?\\d|2[0-3]):[0-5]\\d';

type EtaFieldsProps = {
    value: { day: string; time: string };
    onChange: (value: { day: string; time: string }) => void;
};

export function EtaFields({ value, onChange }: EtaFieldsProps) {
    return (
        <FormField label="Ожидаемое время восстановления" hint="Необязательно. Клиенты увидят его в ответе бота.">
            <span className="eta-fields">
                <DatePicker
                    aria-label="День восстановления"
                    value={value.day}
                    placeholder="День"
                    onChange={(day) => {
                        onChange({ day, time: value.time || '18:00' });
                    }}
                />

                <input
                    className="eta-fields__time"
                    aria-label="Время восстановления"
                    inputMode="numeric"
                    placeholder="18:00"
                    pattern={TIME_PATTERN}
                    maxLength={5}
                    value={value.time}
                    onChange={(event) => {
                        onChange({ ...value, time: event.currentTarget.value });
                    }}
                />

                {value.day ? (
                    <button
                        type="button"
                        className="eta-fields__clear"
                        onClick={() => {
                            onChange({ day: '', time: '' });
                        }}
                    >
                        Без срока
                    </button>
                ) : null}
            </span>
        </FormField>
    );
}
