import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { AdminPanel } from '@/features/admin';
import { NotificationsPage, useNotifications } from '@/features/notifications';
import type { Draft } from '@/features/ticket-detail';
import { TicketsPage, useTicketFilters, useTicketList } from '@/features/ticket-queue';
import { dictionariesQuery, employeesQuery } from '@/shared/api/reference-data';
import { IS_DEMO } from '@/shared/config/env';
import type { Session } from '@/shared/types/api';

import { Sidebar, type Section } from './Sidebar/Sidebar';
import { Topbar } from './Topbar/Topbar';
import { useLiveUpdates } from './use-live-updates';

type WorkspaceProps = {
  session: Session;
  drafts: Map<string, Draft>;
};

/**
 * The signed-in layout. The queue's filters and list live here, not in the tickets page, so they
 * persist across sections and keep the sidebar count current.
 */
export function Workspace({ session, drafts }: WorkspaceProps) {
  const timezone = session.organization.timezone;
  const [expanded, setExpanded] = useState<string | null>(null);
  const [section, setSection] = useState<Section>('tickets');
  const queue = useTicketFilters(timezone);
  const dictionaries = useQuery(dictionariesQuery);
  const employees = useQuery(employeesQuery);
  const notifications = useNotifications();
  const live = useLiveUpdates();
  const ticketList = useTicketList(queue.query, live.connection);
  const unread = notifications.data?.items.filter((item) => !item.read_at).length ?? 0;
  const openTicket = (id: string) => {
    setSection('tickets');
    setExpanded(id);
  };
  return (
    <div className="app-shell">
      <Sidebar
        session={session}
        section={section}
        onSection={setSection}
        openCount={ticketList.counts?.open}
        unread={unread}
      />
      <main className="main">
        <Topbar organization={session.organization.name} connection={live.connection} />
        <div className="main-content">
          {IS_DEMO ? (
            <div className="demo-note">
              Локальный стенд · вымышленные обращения · сообщения в MAX не отправляются
            </div>
          ) : null}
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
              changed={live.changed}
              onRefresh={() => {
                live.refresh();
                live.acknowledge();
              }}
              onAcknowledge={live.acknowledge}
            />
          ) : null}
          {section === 'notifications' ? (
            <NotificationsPage
              notifications={notifications}
              timezone={timezone}
              onOpenTicket={openTicket}
            />
          ) : null}
          {section === 'admin' ? <AdminPanel session={session} onTicket={openTicket} /> : null}
        </div>
      </main>
    </div>
  );
}
