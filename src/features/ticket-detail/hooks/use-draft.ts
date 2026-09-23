import { useEffect, useState } from 'react';

import { protectDraft } from '@/shared/platform/max-bridge';

import { emptyDraft, type Draft } from '../model/draft';

/** The card's draft, restored from `drafts` when the card is reopened. */
export function useDraft(id: string, drafts: Map<string, Draft>) {
  return useState<Draft>(() => drafts.get(id) ?? emptyDraft());
}

/**
 * Saves the draft into `drafts` on every change and, while it is dirty, asks the host and the
 * browser to confirm closing the window.
 */
export function useDraftGuard(
  id: string,
  drafts: Map<string, Draft>,
  draft: Draft,
  dirty: boolean,
) {
  useEffect(() => {
    drafts.set(id, draft);
    protectDraft(dirty);
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        // Older WebViews show the prompt only when returnValue is set.
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
