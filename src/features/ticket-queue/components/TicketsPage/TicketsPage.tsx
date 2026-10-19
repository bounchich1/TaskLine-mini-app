import { clsx } from 'clsx';
import { useCallback, type Dispatch, type SetStateAction } from 'react';

import type { Draft, TicketNavigation } from '@/features/ticket-detail';
import { useBulk } from '@/features/ticket-queue/hooks/use-bulk';
import { useQueueKeys } from '@/features/ticket-queue/hooks/use-queue-keys';
import type { TicketFilters } from '@/features/ticket-queue/hooks/use-ticket-filters';
import type { TicketList as TicketListData } from '@/features/ticket-queue/hooks/use-ticket-list';
import { useTeams } from '@/shared/api/reference-data';
import { can } from '@/shared/lib/access';
import type { Dictionary, Employee, Session } from '@/shared/types/api';

import { QueueContent } from '../QueueContent/QueueContent';
import { QueueDetail } from '../QueueDetail/QueueDetail';
import { QueueFooter } from '../QueueFooter/QueueFooter';
import { QueueHead } from '../QueueHead/QueueHead';

import './TicketsPage.scss';

type TicketsPageProps = {
    session: Session;
    drafts: Map<string, Draft>;
    queue: TicketFilters;
    ticketList: TicketListData;
    dictionaries: Dictionary[] | undefined;
    employees: Employee[] | undefined;
    expanded: string | null;
    onExpand: Dispatch<SetStateAction<string | null>>;
    navigation: TicketNavigation;
    split: boolean;
    changed: boolean;
    onRefresh: () => void;
    onAcknowledge: () => void;
};

const pageClass = ({ expanded, split, compact }: { expanded: string | null; split: boolean; compact: boolean }) =>
    clsx('tickets-page', {
        'tickets-page--open': expanded,
        'tickets-page--split': split,
        'tickets-page--compact': compact,
    });

export function TicketsPage(props: TicketsPageProps) {
    const { session, queue, ticketList, expanded, onExpand, navigation, split } = props;
    const { list, rows, counts } = ticketList;
    const timezone = session.organization.timezone;
    const tab = queue.filters.tab;
    const compact = !split || expanded !== null;
    const teams = useTeams();
    const bulk = useBulk();
    const bulkAllowed = can(session, 'tickets.bulk') && !compact;

    const onToggle = useCallback(
        (id: string) => {
            onExpand((current) => (current === id ? null : id));
        },
        [onExpand],
    );

    useQueueKeys({ rows, expanded, onExpand, enabled: split });

    return (
        <div className={pageClass({ expanded, split, compact })}>
            <section className="tickets-page__queue" aria-label="Очередь обращений">
                <QueueHead
                    session={session}
                    queue={queue}
                    ticketList={ticketList}
                    teams={teams}
                    bulk={bulkAllowed ? bulk : null}
                    dictionaries={props.dictionaries}
                    employees={props.employees}
                    changed={props.changed}
                    onRefresh={props.onRefresh}
                    onAcknowledge={props.onAcknowledge}
                />

                <div className="tickets-page__scroll">
                    <QueueContent
                        rows={rows}
                        loading={list.isPending}
                        searching={Boolean(queue.filters.q) || queue.activeFilters > 0}
                        compact={compact}
                        tab={tab}
                        timezone={timezone}
                        expanded={expanded}
                        onToggle={onToggle}
                        selection={bulkAllowed ? bulk : undefined}
                    />

                    <QueueFooter ticketList={ticketList} total={counts?.[tab]} />
                </div>
            </section>

            {expanded ? (
                <QueueDetail
                    id={expanded}
                    session={session}
                    drafts={props.drafts}
                    dictionaries={props.dictionaries}
                    employees={props.employees}
                    navigation={navigation}
                    onExpand={onExpand}
                />
            ) : null}
        </div>
    );
}
