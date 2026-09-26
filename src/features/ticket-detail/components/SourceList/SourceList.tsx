import type { SuggestionSource } from '@/shared/types/api';

import { SourceChip } from '../SourceChip/SourceChip';

type SourceListProps = {
    sources: SuggestionSource[];
    onSource: (memoryId: string) => void;
};

export function SourceList({ sources, onSource }: SourceListProps) {
    if (!sources.length) {
        return <small className="ai-panel__sources">Без похожих обращений</small>;
    }

    return (
        <small className="ai-panel__sources">
            Источники:
            {sources.map((source) => (
                <SourceChip key={source.memory_id} source={source} onOpen={onSource} />
            ))}
        </small>
    );
}
