import { Button } from '@maxhub/max-ui';
import { useState } from 'react';

import type { AdminSave } from '@/features/admin/hooks/use-admin-save';
import type { Resolution } from '@/features/admin/model/types';
import { ErrorNotice, FormField, Modal } from '@/shared/ui';

const MIN_EVIDENCE_LENGTH = 10;

type ResolutionDialogProps = {
    resolution: Resolution;
    busy: boolean;
    error: unknown;
    save: AdminSave;
    onClose: () => void;
};

export function ResolutionDialog({ resolution, busy, error, save, onClose }: ResolutionDialogProps) {
    const [evidence, setEvidence] = useState('');
    const { item, action } = resolution;

    return (
        <Modal
            title="Проверить результат отправки"
            onClose={onClose}
            busy={busy}
            footer={
                <Button
                    size="small"
                    loading={busy}
                    disabled={evidence.trim().length < MIN_EVIDENCE_LENGTH}
                    onClick={() => {
                        void save(`/v1/messages/${item.message_id ?? ''}/${action}`, {
                            method: 'POST',
                            body: { evidence },
                        });
                    }}
                >
                    {action === 'retry' ? 'Подтвердить повтор' : 'Не повторять отправку'}
                </Button>
            }
        >
            <p>
                Сервер не знает, доставлено ли сообщение. Повтор может создать дубликат у клиента. Укажите результаты
                проверки и основание решения.
            </p>

            <FormField label="Подтверждение проверки">
                <textarea
                    value={evidence}
                    onChange={(event) => {
                        setEvidence(event.target.value);
                    }}
                    minLength={MIN_EVIDENCE_LENGTH}
                    maxLength={2000}
                    required
                />
            </FormField>

            <ErrorNotice error={error} />
        </Modal>
    );
}
