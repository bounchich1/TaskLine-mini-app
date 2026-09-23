import { MAX_NOTE_LENGTH } from '@/features/ticket-detail/model/limits';

type ReasonFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
};

/** The free-text note of a ticket dialog. */
export function ReasonField({ label, value, onChange, required = false }: ReasonFieldProps) {
  return (
    <label className="form-field">
      {label}
      <textarea
        required={required}
        maxLength={MAX_NOTE_LENGTH}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      />
    </label>
  );
}
