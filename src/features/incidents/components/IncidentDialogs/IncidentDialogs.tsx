import { useIncidentAction } from '@/features/incidents/hooks/use-incidents';
import type { IncidentDetail } from '@/shared/types/incidents';

import { EditIncidentDialog } from '../EditIncidentDialog/EditIncidentDialog';
import { EtaDialog } from '../EtaDialog/EtaDialog';
import type { IncidentDialog } from '../IncidentActions/IncidentActions';
import { TextDialog } from '../TextDialog/TextDialog';

type IncidentDialogsProps = {
    incident: IncidentDetail;
    dialog: IncidentDialog | null;
    timezone: string;
    onClose: () => void;
};

export function IncidentDialogs({ incident, dialog, timezone, onClose }: IncidentDialogsProps) {
    const action = useIncidentAction(onClose);
    const path = `/v1/incidents/${incident.id}`;
    const state = { busy: action.isPending, error: action.error, onClose };
    const recipients = incident.linked_open;

    switch (dialog) {
        case 'message':
            return (
                <TextDialog
                    {...state}
                    title="Написать всем"
                    label="Сообщение клиентам"
                    hint={`Получат клиенты всех открытых связанных обращений: ${recipients}.`}
                    submitLabel="Отправить"
                    onSubmit={(text) => {
                        action.mutate({ path: `${path}/messages`, body: { text } });
                    }}
                />
            );
        case 'resolve':
            return (
                <TextDialog
                    {...state}
                    title="Завершить инцидент"
                    label="Финальное сообщение"
                    hint={`Его получат клиенты, и все открытые связанные обращения (${recipients}) закроются.`}
                    defaultValue="Связь восстановлена. Если проблема осталась, просто напишите — мы разберёмся."
                    submitLabel="Завершить и закрыть обращения"
                    option={{ label: 'Попросить клиентов оценить поддержку', checked: incident.request_rating }}
                    onSubmit={(text, rating) => {
                        action.mutate({
                            path: `${path}/resolve`,
                            body: { text, request_rating: rating },
                            version: incident.version,
                        });
                    }}
                />
            );
        case 'reopen':
            return (
                <TextDialog
                    {...state}
                    title="Возобновить инцидент"
                    label="Сообщение клиентам открытых обращений (необязательно)"
                    hint="Новые обращения клиентов, чьи обращения недавно закрыл инцидент, привяжутся снова."
                    submitLabel="Возобновить"
                    required={false}
                    onSubmit={(text) => {
                        action.mutate({
                            path: `${path}/reopen`,
                            body: text ? { text } : {},
                            version: incident.version,
                        });
                    }}
                />
            );
        case 'eta':
            return <EtaDialog {...state} incident={incident} timezone={timezone} action={action} />;
        case 'edit':
            return <EditIncidentDialog {...state} incident={incident} action={action} />;
        default:
            return null;
    }
}
