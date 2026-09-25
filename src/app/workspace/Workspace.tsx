import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { useState } from 'react';

import { AdminPanel } from '@/features/admin';
import { countUnread, NotificationsPage, useNotifications } from '@/features/notifications';
import type { Draft } from '@/features/ticket-detail';
import { TicketsPage, useTicketFilters, useTicketList } from '@/features/ticket-queue';
import { dictionariesQuery, employeesQuery } from '@/shared/api/reference-data';
import { MEDIA, useMediaQuery } from '@/shared/lib/use-media-query';
import type { Session } from '@/shared/types/api';

import { AppHeader, type Section } from './AppHeader/AppHeader';
import { StatusBanners } from './StatusBanners/StatusBanners';
import { useLiveUpdates } from './use-live-updates';

import './Workspace.scss';

type WorkspaceProps = {
    session: Session;
    drafts: Map<string, Draft>;
};

export function Workspace({ session, drafts }: WorkspaceProps) {
    const timezone = session.organization.timezone;
    const [expanded, setExpanded] = useState<string | null>(null);
    const [section, setSection] = useState<Section>('tickets');
    const desktop = useMediaQuery(MEDIA.desktop);
    const queue = useTicketFilters(timezone);
    const dictionaries = useQuery(dictionariesQuery);
    const employees = useQuery(employeesQuery);
    const notifications = useNotifications();
    const live = useLiveUpdates();
    const ticketList = useTicketList(queue.query, live.connection);

    const openTicket = (id: string) => {
        setSection('tickets');
        setExpanded(id);
    };

    const focused = section === 'tickets' && expanded !== null && !desktop;

    return (
        <div className={clsx('workspace', focused && 'workspace--focused')}>
            <StatusBanners connection={live.connection} />

            <AppHeader
                session={session}
                section={section}
                onSection={setSection}
                openCount={ticketList.counts?.open}
                unread={countUnread(notifications)}
                connection={live.connection}
            />

            <main className={clsx('workspace__main', section !== 'tickets' && 'workspace__main--page')}>
                {section === 'tickets' ? (
                    <TicketsPage
                        session={session}
                        drafts={drafts}
                        queue={queue}
                        ticketList={ticketList}
                        dictionaries={dictionaries.data?.items}
                        employees={employees.data?.items}
                        expanded={expanded}
                        onExpand={setExpanded}
                        split={desktop}
                        changed={live.changed}
                        onRefresh={() => {
                            live.refresh();
                            live.acknowledge();
                        }}
                        onAcknowledge={live.acknowledge}
                    />
                ) : null}

                {section === 'notifications' ? (
                    <NotificationsPage notifications={notifications} timezone={timezone} onOpenTicket={openTicket} />
                ) : null}

                {section === 'admin' ? <AdminPanel session={session} onTicket={openTicket} /> : null}
            </main>
        </div>
    );
}
