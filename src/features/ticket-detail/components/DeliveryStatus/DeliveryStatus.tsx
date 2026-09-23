import { CANCELABLE_DELIVERIES } from '@/features/ticket-detail/model/messages';
import { api } from '@/shared/api/http';
import { deliveryLabel } from '@/shared/config/labels';
import type { Message } from '@/shared/types/api';
import { Icon } from '@/shared/ui';

type DeliveryStatusProps = {
  message: Message;
  canAct: boolean;
  canSend: boolean;
  onChanged: () => Promise<void>;
  onError: (error: unknown) => void;
};

/** Delivery state of a staff message, with cancel and retry where allowed. */
export function DeliveryStatus({
  message,
  canAct,
  canSend,
  onChanged,
  onError,
}: DeliveryStatusProps) {
  const state = message.delivery_state;
  const act = (action: 'cancel' | 'retry') => {
    void api(`/v1/messages/${message.id}/${action}`, { method: 'POST', body: {} })
      .then(onChanged)
      .catch(onError);
  };
  return (
    <div className={`delivery delivery-${state}`}>
      <Icon name={state === 'delivered' ? 'check' : 'clock'} size={12} />
      {deliveryLabel(state)}
      {canAct && CANCELABLE_DELIVERIES.includes(state) ? (
        <button
          className="text-button"
          onClick={() => {
            act('cancel');
          }}
        >
          Отменить
        </button>
      ) : null}
      {canAct && canSend && state === 'failed' ? (
        <button
          className="text-button"
          onClick={() => {
            act('retry');
          }}
        >
          Повторить
        </button>
      ) : null}
      {state === 'unknown' ? <span> · Требуется проверка руководителя</span> : null}
    </div>
  );
}
