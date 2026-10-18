import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { api } from '@/shared/api/http';

import { profilePayload, type ProfileDraft } from '../model/profile-form';
import type { BusinessProfile } from '../model/types';

export const SETUP_STEPS = ['Сфера бизнеса', 'О компании', 'Темы обращений', 'Ответы клиентам', 'Готово'] as const;

export function useSetupWizard(initial: BusinessProfile, onClose: () => void) {
    const cache = useQueryClient();
    const [step, setStep] = useState(0);
    const [profile, setProfile] = useState(initial);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<unknown>(null);

    const saveProfile = async (changes: Partial<ProfileDraft>, configured = false) => {
        setProfile(
            await api<BusinessProfile>('/v1/admin/profile', {
                method: 'PUT',
                body: profilePayload(profile, changes, configured),
                version: profile.version,
            }),
        );
    };

    const run = async (work: () => Promise<void>, finish = false) => {
        setBusy(true);
        setError(null);

        try {
            await work();
            await cache.invalidateQueries();

            if (finish) {
                onClose();
            } else {
                setStep((current) => Math.min(current + 1, SETUP_STEPS.length - 1));
            }
        } catch (failure) {
            setError(failure);
        } finally {
            setBusy(false);
        }
    };

    const back = () => {
        setError(null);
        setStep((current) => Math.max(current - 1, 0));
    };

    const fail = (message: string) => {
        setError(new Error(message));
    };

    return { step, profile, setProfile, busy, error, run, back, fail, saveProfile };
}

type SetupWizardState = ReturnType<typeof useSetupWizard>;

export type SetupStepProps = { wizard: SetupWizardState; formId: string };
