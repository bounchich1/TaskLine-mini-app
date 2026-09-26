import { clsx } from 'clsx';

import { sourceHint } from '@/features/ticket-detail/model/suggestion';
import type { SuggestionSource } from '@/shared/types/api';

import './SourceChip.scss';

type SourceChipProps = {
    source: SuggestionSource;
    onOpen: (memoryId: string) => void;
};

export function SourceChip({ source, onOpen }: SourceChipProps) {
    if (source.state === 'gone' || !source.number) {
        return <span className="source-chip source-chip--gone">источник недоступен</span>;
    }

    return (
        <button
            type="button"
            className={clsx('source-chip', source.state !== 'ok' && 'source-chip--warning')}
            title={sourceHint(source)}
            aria-label={`Решение из обращения №${source.number}`}
            onClick={() => {
                onOpen(source.memory_id);
            }}
        >
            №{source.number}
        </button>
    );
}
