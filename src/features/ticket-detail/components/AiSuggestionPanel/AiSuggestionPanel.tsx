import { useState } from 'react';

import type { Ticket } from '@/shared/types/api';
import { Icon } from '@/shared/ui';

import { AiSuggestionBody } from '../AiSuggestionBody/AiSuggestionBody';
import { SourcePeek } from '../SourcePeek/SourcePeek';

import './AiSuggestionPanel.scss';

type AiSuggestionPanelProps = {
    ticket: Ticket;
    timezone: string;
    canInsert: boolean;
    onInsert: (text: string) => void;
    onOpenSource: (sourceId: string) => void;
};

export function AiSuggestionPanel({ ticket, timezone, canInsert, onInsert, onOpenSource }: AiSuggestionPanelProps) {
    const [peek, setPeek] = useState<string | null>(null);

    return (
        <div className="ai-panel">
            <h3 className="ai-panel__title">
                <Icon name="spark" size={16} />
                Подсказка
                <span className="ai-panel__private">видна только сотрудникам</span>
            </h3>

            <AiSuggestionBody ticket={ticket} canInsert={canInsert} onInsert={onInsert} onSource={setPeek} />

            {peek ? (
                <SourcePeek
                    ticketId={ticket.id}
                    memoryId={peek}
                    timezone={timezone}
                    onClose={() => {
                        setPeek(null);
                    }}
                    onOpenTicket={(sourceId) => {
                        setPeek(null);
                        onOpenSource(sourceId);
                    }}
                />
            ) : null}
        </div>
    );
}
