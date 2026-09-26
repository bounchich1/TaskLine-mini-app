import type { TicketDialog } from '@/features/ticket-detail/model/dialogs';
import type { Employee, Ticket } from '@/shared/types/api';
import { ErrorNotice, FormField, Select } from '@/shared/ui';

import { ReasonField } from '../ReasonField/ReasonField';

type TicketDialogBodyProps = {
    dialog: TicketDialog;
    ticket: Ticket;
    employees: Employee[];
    unresolved: boolean;
    reason: string;
    onReason: (value: string) => void;
    target: string;
    onTarget: (value: string) => void;
};

const UNRESOLVED = new Error('Есть неподтверждённые отправки. Дождитесь доставки или отмените их.');

export function TicketDialogBody(props: TicketDialogBodyProps) {
    const { dialog, ticket, employees, unresolved, reason, onReason, target, onTarget } = props;

    if (dialog === 'close') {
        return (
            <>
                <p>
                    Обращение №{ticket.number} перейдёт в «Ожидает оценки». Клиент получит просьбу оценить работу
                    поддержки. Переписка будет сохранена для анализа.
                </p>

                {unresolved ? <ErrorNotice error={UNRESOLVED} /> : null}
                <ReasonField label="Внутренний итог (необязательно)" value={reason} onChange={onReason} />
            </>
        );
    }

    if (dialog === 'transfer') {
        return (
            <>
                <FormField label="Новый исполнитель">
                    <Select
                        placeholder="Выберите сотрудника"
                        options={employees
                            .filter((employee) => employee.status === 'active' && employee.id !== ticket.assignee_id)
                            .map((employee) => ({ value: employee.id, label: employee.name }))}
                        value={target}
                        onChange={onTarget}
                    />
                </FormField>

                <ReasonField label="Комментарий к передаче" value={reason} onChange={onReason} required />
            </>
        );
    }

    if (dialog === 'reopen') {
        return (
            <>
                <p>Клиент сможет продолжить переписку. Предыдущие оценки останутся в истории.</p>
                <ReasonField label="Причина" value={reason} onChange={onReason} required />
            </>
        );
    }

    return <p>Черновик останется в этом окне. После закрытия приложения он будет утрачен.</p>;
}
