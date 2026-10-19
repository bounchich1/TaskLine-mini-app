import { Button } from '@maxhub/max-ui';
import { useState } from 'react';

import { LinkIncidentDialog } from '@/features/incidents';
import type { Bulk } from '@/features/ticket-queue/hooks/use-bulk';

type BulkIncidentLinkProps = {
    bulk: Bulk;
    timezone: string;
    disabled: boolean;
};

export function BulkIncidentLink({ bulk, timezone, disabled }: BulkIncidentLinkProps) {
    const [linking, setLinking] = useState(false);

    return (
        <>
            <Button
                size="xsmall"
                variant="secondary"
                disabled={disabled}
                onClick={() => {
                    setLinking(true);
                }}
            >
                В инцидент…
            </Button>

            {linking ? (
                <LinkIncidentDialog
                    ticketIds={[...bulk.selected]}
                    timezone={timezone}
                    onClose={() => {
                        setLinking(false);
                    }}
                    onDone={() => {
                        setLinking(false);
                        bulk.clear();
                    }}
                />
            ) : null}
        </>
    );
}
