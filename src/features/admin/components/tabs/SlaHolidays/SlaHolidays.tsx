import { AdminCard } from '@/features/admin/components/AdminCard/AdminCard';
import { mergeDates, russianHolidays, type SlaDraft } from '@/features/admin/model/sla-form';
import { FormField } from '@/shared/ui';

import { SlaDates } from '../SlaDates/SlaDates';

import './SlaHolidays.scss';

type SlaHolidaysProps = Pick<SlaDraft, 'holidays' | 'workdays'> & {
    onChange: (patch: Partial<Pick<SlaDraft, 'holidays' | 'workdays'>>) => void;
};

export function SlaHolidays({ holidays, workdays, onChange }: SlaHolidaysProps) {
    const year = new Date().getFullYear();

    return (
        <AdminCard
            title="Праздники"
            action={
                <button
                    type="button"
                    className="sla-holidays__import"
                    onClick={() => {
                        onChange({
                            holidays: mergeDates(holidays, [...russianHolidays(year), ...russianHolidays(year + 1)]),
                        });
                    }}
                >
                    Праздники РФ {year}–{year + 1}
                </button>
            }
        >
            <SlaDates
                label="Нерабочие дни"
                dates={holidays}
                onChange={(dates) => {
                    onChange({ holidays: dates });
                }}
            />

            <p className="admin-card__help">Переносы выходных по постановлению правительства добавьте вручную.</p>

            <FormField label="Рабочие выходные">
                <SlaDates
                    label="Рабочие выходные"
                    dates={workdays}
                    onChange={(dates) => {
                        onChange({ workdays: dates });
                    }}
                />
            </FormField>
        </AdminCard>
    );
}
