import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { api } from '@/shared/api/http';
import { queryKeys } from '@/shared/api/query-keys';
import { employeesQuery } from '@/shared/api/reference-data';
import type { Session, TicketPage } from '@/shared/types/api';
import type { Presence } from '@/shared/types/routing';

type PresenceResult = { presence: Presence; presence_at: string | null; active: number };

async function releaseMyTickets(employeeId: string): Promise<void> {
    const page = await api<TicketPage>(`/v1/tickets?tab=open&status=in_progress&assignee=${employeeId}&limit=100`);

    for (const ticket of page.items) {
        await api(`/v1/tickets/${ticket.id}/release`, { method: 'POST', body: {}, version: ticket.version });
    }
}

export function usePresence(session: Session) {
    const cache = useQueryClient();
    const employees = useQuery(employeesQuery);
    const [local, setLocal] = useState<Presence>(session.employee.presence ?? 'offline');
    const [active, setActive] = useState(0);
    const live = employees.data?.items.find((employee) => employee.id === session.employee.id)?.presence;

    const change = useMutation({
        mutationFn: (presence: Presence) => api<PresenceResult>('/v1/presence', { method: 'PUT', body: { presence } }),
        onSuccess: (result) => {
            setLocal(result.presence);
            setActive(result.presence === 'offline' ? result.active : 0);
            void cache.invalidateQueries({ queryKey: queryKeys.employees });
        },
    });

    const release = useMutation({
        mutationFn: () => releaseMyTickets(session.employee.id),
        onSuccess: () => {
            setActive(0);
            void cache.invalidateQueries({ queryKey: queryKeys.tickets });
        },
    });

    return {
        presence: (change.isPending ? change.variables : undefined) ?? live ?? local,
        change,
        release,
        active,
        keep: () => {
            setActive(0);
        },
    };
}

export type PresenceState = ReturnType<typeof usePresence>;
