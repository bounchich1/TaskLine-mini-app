import type { SetupStepProps } from '@/features/admin/hooks/use-setup-wizard';
import { readToneForm } from '@/features/admin/model/profile-form';

import { ProfileFields } from '../ProfileFields/ProfileFields';

export function ToneStep({ wizard, formId }: SetupStepProps) {
    return (
        <form
            id={formId}
            className="setup-step"
            onSubmit={(event) => {
                event.preventDefault();
                const { draft, error } = readToneForm(new FormData(event.currentTarget));

                if (error) {
                    wizard.fail(error);
                } else {
                    void wizard.run(() => wizard.saveProfile(draft));
                }
            }}
        >
            <p className="setup-step__lead">
                Так ИИ будет составлять черновики ответов клиентам. Сотрудник всегда видит ответ до отправки.
            </p>

            <ProfileFields profile={wizard.profile} />
        </form>
    );
}
