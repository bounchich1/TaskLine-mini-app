import { Button } from '@maxhub/max-ui';

import { useIncidentAction, useIncidentSettings } from '@/features/incidents/hooks/use-incidents';
import { CheckboxField, ErrorNotice, FormField, Modal } from '@/shared/ui';

import './IncidentSettingsDialog.scss';

type IncidentSettingsDialogProps = { onClose: () => void };

const NUMBERS = [
    { name: 'min_tickets', label: 'Не меньше обращений', min: 2, max: 1000, step: 1 },
    { name: 'spike_factor', label: 'Во сколько раз выше обычного', min: 1, max: 50, step: 0.5 },
    { name: 'window_minutes', label: 'Окно, минут', min: 5, max: 120, step: 1 },
    { name: 'relink_hours', label: 'Повторная привязка, часов', min: 0, max: 72, step: 1 },
] as const;

export function IncidentSettingsDialog({ onClose }: IncidentSettingsDialogProps) {
    const settings = useIncidentSettings(true);
    const save = useIncidentAction(onClose);
    const current = settings.data;

    return (
        <Modal
            title="Детектор инцидентов"
            onClose={onClose}
            busy={save.isPending}
            footer={
                <Button form="incident-settings-form" type="submit" size="small" loading={save.isPending}>
                    Сохранить
                </Button>
            }
        >
            <ErrorNotice error={settings.error ?? save.error} />

            {current ? (
                <form
                    id="incident-settings-form"
                    className="incident-settings"
                    onSubmit={(event) => {
                        event.preventDefault();
                        const form = new FormData(event.currentTarget);

                        save.mutate({
                            path: '/v1/incidents/settings',
                            method: 'PUT',
                            version: current.version,
                            body: {
                                detection: form.get('detection') === 'on',
                                auto_link: form.get('auto_link') === 'on',
                                ...Object.fromEntries(NUMBERS.map(({ name }) => [name, Number(form.get(name))])),
                            },
                        });
                    }}
                >
                    <CheckboxField name="detection" defaultChecked={current.detection}>
                        Искать всплески обращений раз в минуту
                    </CheckboxField>

                    <CheckboxField name="auto_link" defaultChecked={current.auto_link}>
                        Привязывать новые похожие обращения к открытому инциденту и сразу отвечать клиенту
                    </CheckboxField>

                    <p className="incident-settings__help">
                        Подсказка появляется, когда за окно пришло не меньше указанного числа обращений по теме и в
                        указанное число раз больше обычного для этого дня недели и часа.
                    </p>

                    <div className="incident-settings__numbers">
                        {NUMBERS.map((field) => (
                            <FormField key={field.name} label={field.label}>
                                <input
                                    name={field.name}
                                    type="number"
                                    required
                                    min={field.min}
                                    max={field.max}
                                    step={field.step}
                                    defaultValue={current[field.name]}
                                />
                            </FormField>
                        ))}
                    </div>
                </form>
            ) : null}
        </Modal>
    );
}
