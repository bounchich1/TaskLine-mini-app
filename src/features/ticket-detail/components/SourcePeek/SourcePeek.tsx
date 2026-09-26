import { Button } from '@maxhub/max-ui';

import { useSuggestionSource } from '@/features/ticket-detail/hooks/use-suggestion-source';
import { ErrorNotice, Modal } from '@/shared/ui';

import { SourceExcerptView } from '../SourceExcerptView/SourceExcerptView';

type SourcePeekProps = {
    ticketId: string;
    memoryId: string;
    timezone: string;
    onClose: () => void;
    onOpenTicket: (sourceId: string) => void;
};

export function SourcePeek({ ticketId, memoryId, timezone, onClose, onOpenTicket }: SourcePeekProps) {
    const excerpt = useSuggestionSource(ticketId, memoryId);
    const data = excerpt.data;

    return (
        <Modal
            wide
            title={data ? `Решение из №${data.source.number}` : 'Решение из похожего обращения'}
            cancelLabel="Закрыть"
            onClose={onClose}
            footer={
                data ? (
                    <Button
                        size="small"
                        onClick={() => {
                            onOpenTicket(data.source.ticket_id);
                        }}
                    >
                        Открыть обращение
                    </Button>
                ) : null
            }
        >
            <ErrorNotice error={excerpt.error} />
            {excerpt.isPending ? <p>Загружаем переписку…</p> : null}
            {data ? <SourceExcerptView excerpt={data} timezone={timezone} /> : null}
        </Modal>
    );
}
