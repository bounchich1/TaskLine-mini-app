import { PROFILE_LIMITS } from '@/features/admin/model/profile-form';
import type { BusinessProfile } from '@/features/admin/model/types';
import { FormField } from '@/shared/ui';

export function CompanyFields({ profile }: { profile: BusinessProfile }) {
    return (
        <>
            <FormField label="Чем занимается компания" hint="2–3 предложения. ИИ учитывает это при разборе обращений.">
                <textarea
                    name="description"
                    rows={3}
                    maxLength={PROFILE_LIMITS.text}
                    defaultValue={profile.description}
                    placeholder="Например: интернет-магазин бытовой техники с доставкой по России"
                />
            </FormField>

            <FormField label="Товары и услуги" hint="Названия, которые клиенты упоминают в обращениях.">
                <textarea
                    name="offerings"
                    rows={2}
                    maxLength={PROFILE_LIMITS.text}
                    defaultValue={profile.offerings}
                    placeholder="Например: холодильники, стиральные машины, установка и гарантийный ремонт"
                />
            </FormField>
        </>
    );
}
