import { Button } from '@maxhub/max-ui';

import { Modal } from '@/shared/ui';

type CollisionDialogProps = { message: string; pending: boolean; onSend: () => void; onCancel: () => void };

export function CollisionDialog({ message, pending, onSend, onCancel }: CollisionDialogProps) {
    return (
        <Modal
            title="Коллега уже ответил"
            onClose={onCancel}
            busy={pending}
            cancelLabel="Не отправлять"
            footer={
                <Button size="small" loading={pending} onClick={onSend}>
                    Отправить всё равно
                </Button>
            }
        >
            <p>{message}</p>
            <p className="modal__hint">Проверьте переписку, чтобы клиент не получил два разных ответа.</p>
        </Modal>
    );
}
