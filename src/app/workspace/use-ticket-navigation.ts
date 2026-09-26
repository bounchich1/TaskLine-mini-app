import { useCallback, useState, type SetStateAction } from 'react';

import type { TicketNavigation, TicketRef } from '@/features/ticket-detail';

export function useTicketNavigation() {
    const [expanded, setExpanded] = useState<string | null>(null);
    const [trail, setTrail] = useState<{ from: TicketRef; to: string } | null>(null);

    const expand = useCallback((value: SetStateAction<string | null>) => {
        setTrail(null);
        setExpanded(value);
    }, []);

    const navigation: TicketNavigation = {
        returnTo: trail?.to === expanded ? trail.from : null,
        openSource: (to, from) => {
            setTrail({ from, to });
            setExpanded(to);
        },
        goBack: () => {
            expand(trail?.from.id ?? null);
        },
    };

    return { expanded, expand, navigation };
}
