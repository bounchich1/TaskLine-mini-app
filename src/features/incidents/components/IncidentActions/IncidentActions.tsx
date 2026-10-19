import { Button } from '@maxhub/max-ui';

import type { Incident } from '@/shared/types/incidents';

import './IncidentActions.scss';

export type IncidentDialog = 'message' | 'eta' | 'edit' | 'resolve' | 'reopen';

type IncidentActionsProps = {
    incident: Incident;
    onDialog: (dialog: IncidentDialog) => void;
};

export function IncidentActions({ incident, onDialog }: IncidentActionsProps) {
    const open = (dialog: IncidentDialog) => () => {
        onDialog(dialog);
    };

    if (incident.status === 'resolved') {
        return (
            <div className="incident-actions">
                <Button size="small" variant="secondary" onClick={open('reopen')}>
                    Возобновить
                </Button>
            </div>
        );
    }

    if (incident.status !== 'open') {
        return null;
    }

    return (
        <div className="incident-actions">
            <Button size="small" onClick={open('message')}>
                Написать всем
            </Button>

            <Button size="small" variant="secondary" onClick={open('eta')}>
                Обновить срок
            </Button>

            <Button size="small" variant="secondary" onClick={open('edit')}>
                Изменить
            </Button>

            <Button size="small" variant="secondary" className="incident-actions__resolve" onClick={open('resolve')}>
                Завершить инцидент
            </Button>
        </div>
    );
}
