import type { ReactNode } from 'react';

import { formatDate } from '@/shared/lib/format-date';
import type { Ticket } from '@/shared/types/api';
import { Avatar } from '@/shared/ui';

import { PropertyRow } from '../PropertyRow/PropertyRow';

import './TicketProperties.scss';

type TicketPropertiesProps = {
    ticket: Ticket;
    timezone: string;
    children: ReactNode;
};

export function TicketProperties({ ticket, timezone, children }: TicketPropertiesProps) {
    return (
        <dl className="properties">
            <PropertyRow label="Исполнитель">
                {ticket.assignee_name ? (
                    <span className="properties__person">
                        <Avatar name={ticket.assignee_name} size={20} />
                        {ticket.assignee_name}
                    </span>
                ) : (
                    <span className="properties__empty">Не назначен</span>
                )}
            </PropertyRow>

            <PropertyRow label="Создано">{formatDate(ticket.created_at, timezone)}</PropertyRow>
            <PropertyRow label="Взято">{formatDate(ticket.taken_at, timezone)}</PropertyRow>

            {ticket.closed_at ? (
                <PropertyRow label="Закрыто">{formatDate(ticket.closed_at, timezone)}</PropertyRow>
            ) : null}

            {children}
        </dl>
    );
}
