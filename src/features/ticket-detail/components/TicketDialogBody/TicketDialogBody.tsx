import type { TicketDialog } from '@/features/ticket-detail/model/dialogs';
import type { Employee, Ticket } from '@/shared/types/api';

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

/** The explanation and fields of a ticket dialog. */
export function TicketDialogBody(props: TicketDialogBodyProps) {
  const { dialog, ticket, employees, unresolved, reason, onReason, target, onTarget } = props;
  if (dialog === 'close') {
    return (
      <>
        <p>
          Обращение №{ticket.number} перейдёт в «Ожидает оценки». Клиент получит просьбу оценить
          работу поддержки. Переписка будет сохранена для анализа.
        </p>
        {unresolved ? (
          <div className="error-notice">
            Есть неподтверждённые отправки. Дождитесь доставки или отмените их.
          </div>
        ) : null}
        <ReasonField label="Внутренний итог (необязательно)" value={reason} onChange={onReason} />
      </>
    );
  }
  if (dialog === 'transfer') {
    return (
      <>
        <label className="form-field">
          Новый исполнитель
          <select
            value={target}
            onChange={(event) => {
              onTarget(event.target.value);
            }}
          >
            <option value="">Выберите сотрудника</option>
            {employees
              .filter((employee) => !employee.blocked && employee.id !== ticket.assignee_id)
              .map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
          </select>
        </label>
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
