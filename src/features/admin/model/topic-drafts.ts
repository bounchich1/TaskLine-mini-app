import { api } from '@/shared/api/http';
import type { Dictionary } from '@/shared/types/api';

export type TopicDraft = { key: string; entry: Dictionary | null; label: string; description: string; active: boolean };

const MAX_RANK = 100;

export function draftOf(entry: Dictionary): TopicDraft {
    return {
        key: entry.code,
        entry,
        label: entry.label,
        description: entry.description ?? '',
        active: entry.active,
    };
}

function isChanged(draft: TopicDraft): boolean {
    const { entry } = draft;

    if (!entry) {
        return true;
    }

    return (
        draft.label !== entry.label || draft.description !== (entry.description ?? '') || draft.active !== entry.active
    );
}

export async function saveTopics(drafts: readonly TopicDraft[], topRank: number): Promise<void> {
    let rank = topRank;

    for (const draft of drafts.filter(isChanged)) {
        const common = { dimension: 'tag', label: draft.label.trim(), description: draft.description.trim() };

        const body = draft.entry
            ? { ...common, code: draft.entry.code, rank: draft.entry.rank, active: draft.active }
            : { ...common, rank: Math.min(MAX_RANK, ++rank), active: draft.active };

        await api('/v1/admin/dictionaries', { method: 'PUT', body, version: draft.entry?.version ?? 0 });
    }
}
