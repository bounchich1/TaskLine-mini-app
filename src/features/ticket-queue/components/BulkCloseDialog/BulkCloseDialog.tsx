import { Button } from '@maxhub/max-ui';
import { useState } from 'react';

import { plural } from '@/shared/lib/plural';
import { FormField, Modal } from '@/shared/ui';

type BulkCloseDialogProps = {
    count: number;
    busy: boolean;
    onClose: () => void;
    onSubmit: (text: string) => void;
};

export function BulkCloseDialog({ count, busy, onClose, onSubmit }: BulkCloseDialogProps) {
    const [text, setText] = useState('');

    return (
        <Modal
            title={`Закрыть ${count} ${plural(count, ['обращение', 'обращения', 'обращений'])}?`}
            onClose={onClose}
            busy={busy}
            footer={
                <Button
                    size="small"
                    loading={busy}
                    onClick={() => {
                        onSubmit(text.trim());
                    }}
                >
                    Закрыть
                </Button>
            }
        >
            <FormField
                label="Сообщение клиентам"
                hint="Необязательно. Если указать, каждое обращение закроется после доставки этого ответа."
            >
                <textarea
                    rows={4}
                    maxLength={4000}
                    value={text}
                    placeholder="Работы завершены, связь восстановлена."
                    onChange={(event) => {
                        setText(event.target.value);
                    }}
                />
            </FormField>
        </Modal>
    );
}
