import { clsx } from 'clsx';
import { useCallback, type Dispatch, type SetStateAction } from 'react';

import { TicketCard, type Draft, type TicketNavigation } from '@/features/ticket-detail';
import type { TicketFilters } from '@/features/ticket-queue/hooks/use-ticket-filters';
import type { TicketList as TicketListData } from '@/features/ticket-queue/hooks/use-ticket-list';
import type { Dictionary, Employee, Session } from '@/shared/types/api';
import { ErrorNotice, Icon, PageHeader } from '@/shared/ui';

import { QueueContent } from '../QueueContent/QueueContent';
import { QueueFilters } from '../QueueFilters/QueueFilters';
import { QueueFooter } from '../QueueFooter/QueueFooter';
import { QueueTabs } from '../QueueTabs/QueueTabs';
import { QueueToolbar } from '../QueueToolbar/QueueToolbar';

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

export function TicketsPage(props: TicketsPageProps) {
    const { session, queue, ticketList, expanded, onExpand, navigation, split } = props;
    const { list, rows, counts } = ticketList;
    const timezone = session.organization.timezone;
    const tab = queue.filters.tab;
    const compact = !split || expanded !== null;

    const onToggle = useCallback(
        (id: string) => {
            onExpand((current) => (current === id ? null : id));
        },
        [onExpand],
    );

    return (
        <div
            className={clsx(
                'tickets-page',
                expanded && 'tickets-page--open',
                split && 'tickets-page--split',
                compact && 'tickets-page--compact',
            )}
        >
            <section className="tickets-page__queue" aria-label="Очередь обращений">
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
                        counts={counts}
                        onSelect={queue.selectTab}
                        changed={props.changed}
                        onAcknowledge={props.onAcknowledge}
                    />

                    <QueueToolbar queue={queue} />

                    {queue.filterOpen ? (
                        <QueueFilters queue={queue} dictionaries={props.dictionaries} employees={props.employees} />
                    ) : null}

                    <ErrorNotice error={list.error} />
                </div>

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
                    />

                    <QueueFooter ticketList={ticketList} total={counts?.[tab]} />
                </div>
            </section>

            {expanded ? (
                <div className="tickets-page__detail">
                    <TicketCard
                        key={expanded}
                        id={expanded}
                        session={session}
                        employees={props.employees ?? []}
                        dictionaries={props.dictionaries ?? []}
                        drafts={props.drafts}
                        navigation={navigation}
                        onClose={() => {
                            if (navigation.returnTo) {
                                navigation.goBack();
                            } else {
                                onExpand(null);
                            }
                        }}
                    />
                </div>
            ) : null}
        </div>
    );
}
