import { useQuery } from '@tanstack/react-query';

import type { SetupStepProps } from '@/features/admin/hooks/use-setup-wizard';
import { formText } from '@/features/admin/model/form-data';
import { readCompanyForm } from '@/features/admin/model/profile-form';
import { timezoneOptions } from '@/features/admin/model/timezones';
import type { OrganizationSettings } from '@/features/admin/model/types';
import { api } from '@/shared/api/http';
import { queryKeys } from '@/shared/api/query-keys';
import { FormField, Select } from '@/shared/ui';

import { CompanyFields } from '../ProfileFields/CompanyFields';

export function CompanyStep({ wizard, formId }: SetupStepProps) {
    const settings = useQuery({
        queryKey: queryKeys.adminSettings,
        queryFn: () => api<OrganizationSettings>('/v1/admin/settings'),
    });

    const current = settings.data;

    if (!current) {
        return null;
    }

    const save = async (form: FormData) => {
        const name = formText(form, 'name');
        const timezone = formText(form, 'timezone');

        if (name !== current.name || timezone !== current.timezone) {
            await api('/v1/admin/settings', { method: 'PUT', body: { name, timezone }, version: current.version });
        }

        await wizard.saveProfile(readCompanyForm(form));
    };

    return (
        <form
            id={formId}
            className="setup-step"
            onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);

                void wizard.run(() => save(form));
            }}
        >
            <FormField label="Название компании">
                <input name="name" defaultValue={current.name} maxLength={120} required />
            </FormField>

            <FormField label="Часовой пояс" hint="По нему считаются рабочие часы и сроки ответа.">
                <Select
                    name="timezone"
                    options={timezoneOptions(current.timezone)}
                    defaultValue={current.timezone}
                    aria-label="Часовой пояс"
                />
            </FormField>

            <CompanyFields profile={wizard.profile} />
        </form>
    );
}
