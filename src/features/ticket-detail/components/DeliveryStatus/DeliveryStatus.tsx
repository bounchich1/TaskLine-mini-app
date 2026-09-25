import { CANCELABLE_DELIVERIES } from '@/features/ticket-detail/model/messages';
import { api } from '@/shared/api/http';
import { deliveryLabel } from '@/shared/config/labels';
import type { Message } from '@/shared/types/api';
import { Icon, type IconName } from '@/shared/ui';

import './DeliveryStatus.scss';

type DeliveryStatusProps = {
    message: Message;
    canAct: boolean;
    canSend: boolean;
    onChanged: () => Promise<void>;
    onError: (error: unknown) => void;
};

function deliveryIcon(state: string): IconName {
    if (state === 'delivered') {
        return 'check';
    }

    return state === 'failed' || state === 'unknown' ? 'alert' : 'clock';
}

export function DeliveryStatus({ message, canAct, canSend, onChanged, onError }: DeliveryStatusProps) {
    const state = message.delivery_state;

    const act = (action: 'cancel' | 'retry') => {
        void api(`/v1/messages/${message.id}/${action}`, { method: 'POST', body: {} }).then(onChanged).catch(onError);
    };

    return (
        <div className={`delivery-status delivery-status--${state}`}>
            <span className="delivery-status__state">
                <Icon name={deliveryIcon(state)} size={12} />
                {deliveryLabel(state)}
            </span>

            {canAct && CANCELABLE_DELIVERIES.includes(state) ? (
                <button
                    className="delivery-status__action"
                    onClick={() => {
                        act('cancel');
                    }}
                >
                    Отменить
                </button>
            ) : null}

            {canAct && canSend && state === 'failed' ? (
                <button
                    className="delivery-status__action"
                    onClick={() => {
                        act('retry');
                    }}
                >
                    Повторить
                </button>
            ) : null}

            {state === 'unknown' ? <span>Нужна проверка руководителя</span> : null}
        </div>
    );
}
