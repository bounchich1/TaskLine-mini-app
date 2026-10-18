import { useState } from 'react';

import { glossaryText, PROFILE_LIMITS, TONE_OPTIONS } from '@/features/admin/model/profile-form';
import type { BusinessProfile } from '@/features/admin/model/types';
import { ChoiceList, FormField } from '@/shared/ui';

import { CompanyFields } from './CompanyFields';

type ProfileFieldsProps = { profile: BusinessProfile; company?: boolean };

const TONE_CHOICES = TONE_OPTIONS.map(({ value, label, note }) => ({ value, title: label, note }));

export function ProfileFields({ profile, company = false }: ProfileFieldsProps) {
    const [tone, setTone] = useState<string>(profile.tone);

    return (
        <>
            {company ? <CompanyFields profile={profile} /> : null}

            <ChoiceList
                name="tone"
                legend="Тон ответов клиентам"
                options={TONE_CHOICES}
                value={tone}
                onChange={setTone}
                columns
            />

            <FormField
                label="Чего нельзя обещать или делать"
                hint={`По одному правилу в строке, до ${PROFILE_LIMITS.rules}. ИИ не нарушит их в подсказках и ответах.`}
            >
                <textarea
                    name="rules"
                    rows={3}
                    defaultValue={profile.rules.join('\n')}
                    placeholder="Не обещать возврат денег до проверки товара"
                />
            </FormField>

            <FormField label="Глоссарий" hint="По одному термину в строке: «термин — значение».">
                <textarea
                    name="glossary"
                    rows={3}
                    defaultValue={glossaryText(profile.glossary)}
                    placeholder="ПВЗ — пункт выдачи заказов"
                />
            </FormField>
        </>
    );
}
