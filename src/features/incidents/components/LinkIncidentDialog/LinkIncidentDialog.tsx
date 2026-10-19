import { Button } from '@maxhub/max-ui';
import { useState } from 'react';

import { useIncidentAction, useIncidentList } from '@/features/incidents/hooks/use-incidents';
import { ticketsCount } from '@/features/incidents/model/format';
import type { IncidentLinkResult } from '@/shared/types/incidents';
import { ErrorNotice, FormField, Modal, Select } from '@/shared/ui';

import { IncidentForm } from '../IncidentForm/IncidentForm';

import './LinkIncidentDialog.scss';

const SKIP_REASONS: Record<string, string> = {
    not_found: 'не найдено',
    ticket_closed: 'уже закрыто',
    other_incident: 'в другом инциденте',
};

function summary(result: IncidentLinkResult): string {
    const skipped = result.skipped ?? [];
    const reasons = skipped.map((item) => SKIP_REASONS[item.reason] ?? item.reason).join(', ');

    return `Связано: ${ticketsCount(result.linked?.length ?? 0)}.${skipped.length ? ` Пропущено: ${reasons}.` : ''}`;
}

type LinkIncidentDialogProps = {
    ticketIds: string[];
    timezone: string;
    onClose: () => void;
    onDone: () => void;
};

export function LinkIncidentDialog({ ticketIds, timezone, onClose, onDone }: LinkIncidentDialogProps) {
    const incidents = useIncidentList('open');
    const [incidentId, setIncidentId] = useState('');
    const [creating, setCreating] = useState(false);
    const [result, setResult] = useState<IncidentLinkResult | null>(null);
    const link = useIncidentAction<IncidentLinkResult>(setResult);
    const options = (incidents.data?.items ?? []).map((item) => ({ value: item.id, label: item.title }));

    if (creating) {
        return <IncidentForm ticketIds={ticketIds} timezone={timezone} onClose={onClose} onCreated={onDone} />;
    }

    if (result) {
        return (
            <Modal title="Связать с инцидентом" onClose={onDone} cancelLabel="Готово">
                <p className="link-incident__result" role="status">
                    {summary(result)}
                </p>
            </Modal>
        );
    }

    return (
        <Modal
            title="Связать с инцидентом"
            onClose={onClose}
            busy={link.isPending}
            footer={
                <Button
                    size="small"
                    disabled={!incidentId}
                    loading={link.isPending}
                    onClick={() => {
                        link.mutate({ path: `/v1/incidents/${incidentId}/tickets`, body: { ticket_ids: ticketIds } });
                    }}
                >
                    Связать
                </Button>
            }
        >
            <ErrorNotice error={incidents.error ?? link.error} />

            <div className="link-incident">
                <p className="link-incident__help">
                    Выбрано {ticketsCount(ticketIds.length)}. Они уйдут из очереди во вкладку «Инциденты» и получат
                    общие сообщения.
                </p>

                {options.length ? (
                    <FormField label="Открытый инцидент">
                        <Select
                            aria-label="Открытый инцидент"
                            placeholder="Выберите инцидент"
                            options={options}
                            value={incidentId}
                            onChange={setIncidentId}
                        />
                    </FormField>
                ) : (
                    <p className="link-incident__help">Открытых инцидентов нет.</p>
                )}

                <button
                    type="button"
                    className="link-incident__create"
                    onClick={() => {
                        setCreating(true);
                    }}
                >
                    Создать новый инцидент из выбранных
                </button>
            </div>
        </Modal>
    );
}
