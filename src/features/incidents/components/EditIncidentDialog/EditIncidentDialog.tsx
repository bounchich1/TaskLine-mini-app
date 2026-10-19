import { Button } from '@maxhub/max-ui';

import type { useIncidentAction } from '@/features/incidents/hooks/use-incidents';
import { formText } from '@/features/incidents/model/form';
import { parseTerms } from '@/features/incidents/model/format';
import type { Incident } from '@/shared/types/incidents';
import { CheckboxField, ErrorNotice, FormField, Modal } from '@/shared/ui';

import './EditIncidentDialog.scss';

const MESSAGE_HINT = 'Бот отвечает им новым клиентам при автопривязке. Связанным клиентам — через «Написать всем».';

type EditIncidentDialogProps = {
    incident: Incident;
    action: ReturnType<typeof useIncidentAction>;
    busy: boolean;
    error: unknown;
    onClose: () => void;
};

export function EditIncidentDialog({ incident, action, busy, error, onClose }: EditIncidentDialogProps) {
    return (
        <Modal
            title="Изменить инцидент"
            onClose={onClose}
            busy={busy}
            wide
            footer={
                <Button form="incident-edit-form" type="submit" size="small" loading={busy}>
                    Сохранить
                </Button>
            }
        >
            <ErrorNotice error={error} />

            <form
                id="incident-edit-form"
                className="edit-incident-dialog"
                onSubmit={(event) => {
                    event.preventDefault();
                    const form = new FormData(event.currentTarget);
                    const text = (name: string) => formText(form, name);

                    action.mutate({
                        path: `/v1/incidents/${incident.id}`,
                        method: 'PATCH',
                        version: incident.version,
                        body: {
                            title: text('title'),
                            public_message: text('public_message'),
                            match_terms: parseTerms(text('match_terms')),
                            request_rating: form.get('request_rating') === 'on',
                        },
                    });
                }}
            >
                <FormField label="Название">
                    <input name="title" required maxLength={120} defaultValue={incident.title} />
                </FormField>

                <FormField label="Сообщение для клиентов" hint={MESSAGE_HINT}>
                    <textarea name="public_message" rows={3} maxLength={2000} defaultValue={incident.public_message} />
                </FormField>

                <FormField label="Слова для автопривязки" hint="Через запятую, от трёх букв.">
                    <input name="match_terms" defaultValue={incident.match_terms.join(', ')} />
                </FormField>

                <CheckboxField name="request_rating" defaultChecked={incident.request_rating}>
                    Просить оценку при закрытии обращений
                </CheckboxField>
            </form>
        </Modal>
    );
}
