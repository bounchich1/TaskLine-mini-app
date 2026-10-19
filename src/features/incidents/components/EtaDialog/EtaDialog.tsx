import { Button } from '@maxhub/max-ui';
import { useState } from 'react';

import type { useIncidentAction } from '@/features/incidents/hooks/use-incidents';
import { formText } from '@/features/incidents/model/form';
import { zonedInstant, zonedParts } from '@/features/incidents/model/format';
import type { Incident } from '@/shared/types/incidents';
import { CheckboxField, ErrorNotice, FormField, Modal } from '@/shared/ui';

import { EtaFields } from '../EtaFields/EtaFields';

import './EtaDialog.scss';

type EtaDialogProps = {
    incident: Incident;
    timezone: string;
    action: ReturnType<typeof useIncidentAction>;
    busy: boolean;
    error: unknown;
    onClose: () => void;
};

export function EtaDialog({ incident, timezone, action, busy, error, onClose }: EtaDialogProps) {
    const [eta, setEta] = useState(() => zonedParts(incident.eta, timezone));

    return (
        <Modal
            title="Обновить срок"
            onClose={onClose}
            busy={busy}
            footer={
                <Button form="incident-eta-form" type="submit" size="small" loading={busy}>
                    Сохранить
                </Button>
            }
        >
            <ErrorNotice error={error} />

            <form
                id="incident-eta-form"
                className="eta-dialog"
                onSubmit={(event) => {
                    event.preventDefault();
                    const form = new FormData(event.currentTarget);
                    const text = formText(form, 'text');

                    action.mutate({
                        path: `/v1/incidents/${incident.id}/eta`,
                        version: incident.version,
                        body: {
                            eta: zonedInstant(eta.day, eta.time, timezone),
                            notify: form.get('notify') === 'on',
                            ...(text ? { text } : {}),
                        },
                    });
                }}
            >
                <EtaFields value={eta} onChange={setEta} />

                <FormField label="Сообщение клиентам" hint="Пусто — бот сообщит новый срок своими словами.">
                    <textarea name="text" rows={3} maxLength={2000} />
                </FormField>

                <CheckboxField name="notify" defaultChecked>
                    Отправить клиентам открытых обращений
                </CheckboxField>
            </form>
        </Modal>
    );
}
