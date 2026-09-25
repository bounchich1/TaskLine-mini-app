import { useCallback, useState } from 'react';

import { LaunchScreen, useSession } from '@/features/auth';
import type { Draft } from '@/features/ticket-detail';

import { Workspace } from './workspace/Workspace';

export function App() {
    const [drafts] = useState(() => new Map<string, Draft>());

    const clearDrafts = useCallback(() => {
        drafts.clear();
    }, [drafts]);

    const { session, error, loading, retry } = useSession(clearDrafts);

    if (!session) {
        return <LaunchScreen loading={loading} error={error} onRetry={retry} />;
    }

    return <Workspace session={session} drafts={drafts} />;
}
