const TIME_PATTERN = '(?:[01]\\d|2[0-3]):[0-5]\\d|24:00';

type SlaTimeFieldProps = {
    label: string;
    value: string;
    disabled: boolean;
    required?: boolean;
    onChange: (value: string) => void;
};

export function SlaTimeField({ label, value, disabled, required = false, onChange }: SlaTimeFieldProps) {
    const mandatory = required ? !disabled : false;

    return (
        <input
            aria-label={label}
            value={value}
            disabled={disabled}
            required={mandatory}
            inputMode="numeric"
            placeholder="—"
            pattern={TIME_PATTERN}
            maxLength={5}
            onChange={(event) => {
                onChange(event.currentTarget.value);
            }}
        />
    );
}
