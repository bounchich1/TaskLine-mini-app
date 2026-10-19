import type { Dispatch, SetStateAction } from 'react';

import { TicketCard, type Draft, type TicketNavigation } from '@/features/ticket-detail';
import type { Dictionary, Employee, Session } from '@/shared/types/api';

type QueueDetailProps = {
    id: string;
    session: Session;
    drafts: Map<string, Draft>;
    dictionaries: Dictionary[] | undefined;
    employees: Employee[] | undefined;
    navigation: TicketNavigation;
    onExpand: Dispatch<SetStateAction<string | null>>;
};

export function QueueDetail({ id, session, drafts, dictionaries, employees, navigation, onExpand }: QueueDetailProps) {
    return (
        <div className="tickets-page__detail">
            <TicketCard
                key={id}
                id={id}
                session={session}
                employees={employees ?? []}
                dictionaries={dictionaries ?? []}
                drafts={drafts}
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
    );
}
