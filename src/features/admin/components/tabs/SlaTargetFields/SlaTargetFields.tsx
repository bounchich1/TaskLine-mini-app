import type { TargetForm } from '@/features/admin/model/sla-form';

type SlaTargetFieldsProps = {
    label: string;
    target: TargetForm | undefined;
    onChange: (target: TargetForm) => void;
};

export function SlaTargetFields({ label, target, onChange }: SlaTargetFieldsProps) {
    const current = target ?? { first: '', resolution: '' };

    return (
        <>
            <input
                aria-label={`${label}: первый ответ, минут`}
                type="number"
                inputMode="numeric"
                min={1}
                max={43200}
                placeholder="—"
                value={current.first}
                onChange={(event) => {
                    onChange({ ...current, first: event.currentTarget.value });
                }}
            />

            <input
                aria-label={`${label}: решение, часов`}
                type="number"
                inputMode="decimal"
                min={0.25}
                max={720}
                step={0.25}
                placeholder="—"
                value={current.resolution}
                onChange={(event) => {
                    onChange({ ...current, resolution: event.currentTarget.value });
                }}
            />
        </>
    );
}
