import { Button } from '@maxhub/max-ui';

import type { AdminSave } from '@/features/admin/hooks/use-admin-save';
import type { Employee } from '@/shared/types/api';
import { ErrorNotice, Modal } from '@/shared/ui';

type BlockEmployeeDialogProps = {
    employee: Employee;
    busy: boolean;
    error: unknown;
    save: AdminSave;
    onClose: () => void;
};

export function BlockEmployeeDialog({ employee, busy, error, save, onClose }: BlockEmployeeDialogProps) {
    const invited = !employee.activated_at;

    return (
        <Modal
            title={`Заблокировать ${employee.name}?`}
            onClose={onClose}
            busy={busy}
            footer={
                <Button
                    variant="destructive"
                    size="small"
                    loading={busy}
                    onClick={() => {
                        void save(`/v1/admin/employees/${employee.id}`, {
                            method: 'PATCH',
                            body: { blocked: true },
                            version: employee.version,
                        });
                    }}
                >
                    Заблокировать
                </Button>
            }
        >
            <ErrorNotice error={error} />

            {invited ? (
                <p>Приглашение перестанет действовать: сотрудник не сможет войти в приложение.</p>
            ) : (
                <p>
                    Сотрудник сразу потеряет доступ: открытые сессии завершатся, неотправленные ответы будут отменены.
                    Назначенные ему обращения останутся за ним, передайте их коллегам.
                </p>
            )}

            <p>Разблокировать можно в любой момент.</p>
        </Modal>
    );
}
