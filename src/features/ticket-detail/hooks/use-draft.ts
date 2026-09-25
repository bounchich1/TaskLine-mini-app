import { useEffect, useState } from 'react';

import { protectDraft } from '@/shared/platform/max-bridge';

import { emptyDraft, type Draft } from '../model/draft';

export function useDraft(id: string, drafts: Map<string, Draft>) {
    return useState<Draft>(() => drafts.get(id) ?? emptyDraft());
}

export function useDraftGuard(id: string, drafts: Map<string, Draft>, draft: Draft, dirty: boolean) {
    useEffect(() => {
        drafts.set(id, draft);
        protectDraft(dirty);

        const beforeUnload = (event: BeforeUnloadEvent) => {
            if (dirty) {
                event.preventDefault();
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                event.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', beforeUnload);

        return () => {
            window.removeEventListener('beforeunload', beforeUnload);
            protectDraft(false);
        };
    }, [id, draft, drafts, dirty]);
}
