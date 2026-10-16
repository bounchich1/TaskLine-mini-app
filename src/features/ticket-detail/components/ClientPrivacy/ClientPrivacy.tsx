import { Button } from '@maxhub/max-ui';
import { useState } from 'react';

import { exportLabel, useClientPrivacy, type Erasure } from '@/features/ticket-detail/hooks/use-client-privacy';
import type { Ticket } from '@/shared/types/api';
import { CheckboxField, ErrorNotice, Modal } from '@/shared/ui';

import './ClientPrivacy.scss';

function erasureNote(erasure: Erasure) {
    return erasure.already_erased
        ? 'Данные клиента уже были удалены.'
        : `Данные клиента удалены, обращений: ${erasure.tickets}.`;
}

export function ClientPrivacy({ ticket }: { ticket: Pick<Ticket, 'client_id' | 'number'> }) {
    const privacy = useClientPrivacy(ticket.client_id);
    const [confirming, setConfirming] = useState(false);
    const [understood, setUnderstood] = useState(false);

    return (
        <div className="client-privacy">
            <h3 className="ticket-aside__title">Персональные данные клиента</h3>

            <p className="client-privacy__help">
                Запрос клиента на доступ или удаление данных. Действия записываются в журнал аудита.
            </p>

            {privacy.erasure ? <p className="client-privacy__done">{erasureNote(privacy.erasure)}</p> : null}
            {confirming ? null : <ErrorNotice error={privacy.error} />}

            <div className="client-privacy__actions">
                <Button
                    variant="secondary"
                    size="small"
                    loading={privacy.busy === 'export'}
                    onClick={privacy.exportData}
                >
                    {exportLabel(privacy.busy === 'export', privacy.needsGrant)}
                </Button>

                <Button
                    variant="secondary"
                    size="small"
                    disabled={!!privacy.erasure}
                    onClick={() => {
                        setUnderstood(false);
                        setConfirming(true);
                    }}
                >
                    Удалить данные
                </Button>
            </div>

            {confirming ? (
                <Modal
                    title="Удалить данные клиента?"
                    busy={privacy.busy === 'erase'}
                    onClose={() => {
                        setConfirming(false);
                    }}
                    footer={
                        <Button
                            variant="destructive"
                            size="small"
                            disabled={!understood}
                            loading={privacy.busy === 'erase'}
                            onClick={() => {
                                privacy.erase(() => {
                                    setConfirming(false);
                                });
                            }}
                        >
                            Удалить безвозвратно
                        </Button>
                    }
                >
                    <ErrorNotice error={privacy.error} />

                    <p>
                        Открытые обращения клиента закроются без оценки. Переписка, вложения и решения в базе знаний по
                        всем его обращениям, включая №{ticket.number}, будут стёрты.
                    </p>

                    <p>Если клиент напишет снова, он начнёт с нового согласия, как новый клиент.</p>

                    <CheckboxField name="understood" checked={understood} onChange={setUnderstood}>
                        Понимаю, что восстановить данные нельзя
                    </CheckboxField>
                </Modal>
            ) : null}
        </div>
    );
}
