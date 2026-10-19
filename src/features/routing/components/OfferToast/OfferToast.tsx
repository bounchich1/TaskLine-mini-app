import { Button } from '@maxhub/max-ui';
import { useEffect, useRef, useState } from 'react';

import { playChime } from '@/features/routing/model/chime';
import type { Notification } from '@/shared/types/api';
import { Icon } from '@/shared/ui';

import './OfferToast.scss';

const FRESH_MS = 10 * 60000;

type OfferToastProps = { notifications: Notification[] | undefined; onOpen: (ticketId: string) => void };

function latestOffer(items: Notification[] | undefined, dismissed: Set<string>): Notification | undefined {
    return items?.find(
        (item) =>
            item.type === 'ticket.offered' &&
            !item.read_at &&
            !dismissed.has(item.id) &&
            Date.now() - Date.parse(item.created_at) < FRESH_MS,
    );
}

export function OfferToast({ notifications, onOpen }: OfferToastProps) {
    const [dismissed, setDismissed] = useState(() => new Set<string>());
    const announced = useRef(new Set<string>());
    const offer = latestOffer(notifications, dismissed);

    useEffect(() => {
        if (offer && !announced.current.has(offer.id)) {
            announced.current.add(offer.id);
            playChime();
        }
    }, [offer]);

    if (!offer) {
        return null;
    }

    const dismiss = () => {
        setDismissed((current) => new Set(current).add(offer.id));
    };

    return (
        <div className="offer-toast" role="alert">
            <Icon name="inbox" size={20} className="offer-toast__icon" />

            <span className="offer-toast__text">
                Вам предложено обращение №{offer.ticket?.number ?? ''}
                {offer.ticket?.tag_label ? (
                    <small className="offer-toast__topic">{offer.ticket.tag_label}</small>
                ) : null}
            </span>

            <Button
                size="xsmall"
                onClick={() => {
                    dismiss();
                    onOpen(offer.ticket_id);
                }}
            >
                Открыть
            </Button>

            <button className="offer-toast__close" aria-label="Скрыть" onClick={dismiss}>
                <Icon name="close" size={16} />
            </button>
        </div>
    );
}
