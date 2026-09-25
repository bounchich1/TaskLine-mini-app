import { MAX_NOTE_LENGTH } from '@/features/ticket-detail/model/limits';
import { FormField } from '@/shared/ui';

type ReasonFieldProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
};

export function ReasonField({ label, value, onChange, required = false }: ReasonFieldProps) {
    return (
        <FormField label={label}>
            <textarea
                required={required}
                maxLength={MAX_NOTE_LENGTH}
                value={value}
                onChange={(event) => {
                    onChange(event.target.value);
                }}
            />
        </FormField>
    );
}
