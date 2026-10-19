import type { Bulk } from '@/features/ticket-queue/hooks/use-bulk';
import type { TicketFilters } from '@/features/ticket-queue/hooks/use-ticket-filters';
import type { TicketList as TicketListData } from '@/features/ticket-queue/hooks/use-ticket-list';
import { can } from '@/shared/lib/access';
import type { Dictionary, Employee, Session } from '@/shared/types/api';
import type { Team } from '@/shared/types/routing';
import { ErrorNotice, Icon, PageHeader } from '@/shared/ui';

import { BulkBar } from '../BulkBar/BulkBar';
import { QueueFilters } from '../QueueFilters/QueueFilters';
import { QueueScope } from '../QueueScope/QueueScope';
import { QueueTabs } from '../QueueTabs/QueueTabs';
import { QueueToolbar } from '../QueueToolbar/QueueToolbar';

type QueueHeadProps = {
    session: Session;
    queue: TicketFilters;
    ticketList: TicketListData;
    teams: Team[];
    bulk: Bulk | null;
    dictionaries: Dictionary[] | undefined;
    employees: Employee[] | undefined;
    changed: boolean;
    onRefresh: () => void;
    onAcknowledge: () => void;
};

export function QueueHead(props: QueueHeadProps) {
    const { session, queue, ticketList, teams, bulk } = props;
    const tab = queue.filters.tab;

    return (
        <div className="tickets-page__head">
            <PageHeader
                title="Обращения"
                actions={
                    <button className="tickets-page__refresh" aria-label="Обновить" onClick={props.onRefresh}>
                        <Icon name="refresh" size={18} />
                    </button>
                }
            />

            <QueueTabs
                tab={tab}
                counts={ticketList.counts}
                onSelect={queue.selectTab}
                riskOnly={queue.filters.sla === 'at_risk'}
                onToggleRisk={() => {
                    queue.change('sla', queue.filters.sla === 'at_risk' ? '' : 'at_risk');
                }}
                changed={props.changed}
                onAcknowledge={props.onAcknowledge}
            />

            <QueueScope
                me={session.employee.id}
                teams={teams}
                supervisor={can(session, 'tickets.transfer_any')}
                value={{ assignee: queue.filters.assignee, team: queue.filters.team }}
                onChange={queue.selectScope}
            />

            <QueueToolbar queue={queue} />

            {queue.filterOpen ? (
                <QueueFilters queue={queue} dictionaries={props.dictionaries} employees={props.employees} />
            ) : null}

            <ErrorNotice error={ticketList.list.error} />

            {bulk ? (
                <BulkBar
                    bulk={bulk}
                    timezone={session.organization.timezone}
                    canLinkIncident={can(session, 'incidents.manage')}
                    employees={props.employees ?? []}
                    teams={teams}
                    dictionaries={props.dictionaries}
                />
            ) : null}
        </div>
    );
}
