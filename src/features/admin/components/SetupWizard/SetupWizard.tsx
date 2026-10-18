import { Button } from '@maxhub/max-ui';

import { SETUP_STEPS, useSetupWizard } from '@/features/admin/hooks/use-setup-wizard';
import type { BusinessProfile } from '@/features/admin/model/types';
import { ErrorNotice, Modal } from '@/shared/ui';

import { CurrentStep } from './CurrentStep';

import './SetupWizard.scss';

type SetupWizardProps = {
    profile: BusinessProfile;
    onClose: () => void;
};

export function SetupWizard({ profile, onClose }: SetupWizardProps) {
    const wizard = useSetupWizard(profile, onClose);
    const formId = `setup-step-${wizard.step}`;
    const last = wizard.step === SETUP_STEPS.length - 1;

    return (
        <Modal
            title="Настройка под ваш бизнес"
            onClose={onClose}
            busy={wizard.busy}
            cancelLabel="Позже"
            wide
            footer={
                <>
                    {wizard.step > 0 ? (
                        <Button variant="secondary" size="small" disabled={wizard.busy} onClick={wizard.back}>
                            Назад
                        </Button>
                    ) : null}

                    <Button form={formId} type="submit" size="small" loading={wizard.busy}>
                        {last ? 'Завершить' : 'Далее'}
                    </Button>
                </>
            }
        >
            <p className="setup-wizard__progress">
                Шаг {wizard.step + 1} из {SETUP_STEPS.length} · <strong>{SETUP_STEPS[wizard.step]}</strong>
            </p>

            <ErrorNotice error={wizard.error} />
            <CurrentStep key={wizard.step} wizard={wizard} formId={formId} />
        </Modal>
    );
}
