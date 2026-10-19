import { AdminPanel } from '@/features/admin';
import { IncidentsPage } from '@/features/incidents';
import { NotificationsPage, type useNotifications } from '@/features/notifications';
import { ReportsPage } from '@/features/reports';
import type { Session } from '@/shared/types/api';

import type { Section } from '../AppHeader/AppHeader';

type SectionPageProps = {
    section: Exclude<Section, 'tickets'>;
    session: Session;
    notifications: ReturnType<typeof useNotifications>;
    incident: string | null;
    onIncident: (id: string | null) => void;
    onTicket: (id: string) => void;
};

export function SectionPage({ section, session, notifications, incident, onIncident, onTicket }: SectionPageProps) {
    const timezone = session.organization.timezone;

    switch (section) {
        case 'notifications':
            return (
                <NotificationsPage
                    notifications={notifications}
                    me={session.employee.id}
                    timezone={timezone}
                    onOpenTicket={onTicket}
                    onOpenIncident={onIncident}
                />
            );
        case 'incidents':
            return <IncidentsPage session={session} selected={incident} onSelect={onIncident} onTicket={onTicket} />;
        case 'reports':
            return <ReportsPage timezone={timezone} onTicket={onTicket} />;
        case 'admin':
            return <AdminPanel session={session} onTicket={onTicket} />;
    }
}
