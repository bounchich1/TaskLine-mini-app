import { matchQuery, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { fetchAttachment } from '@/shared/api/download';
import { queryKeys } from '@/shared/api/query-keys';
import type { Attachment } from '@/shared/types/api';

const MEDIA_CACHE_MS = 5 * 60000;
const MEDIA_SCOPE = { queryKey: queryKeys.attachmentMedia('').slice(0, 1) };
const watchedClients = new WeakSet<QueryClient>();

function revokeEvictedMedia(client: QueryClient): void {
    if (watchedClients.has(client)) {
        return;
    }

    watchedClients.add(client);

    client.getQueryCache().subscribe((event) => {
        const url: unknown = event.query.state.data;

        if (event.type === 'removed' && matchQuery(MEDIA_SCOPE, event.query) && typeof url === 'string') {
            URL.revokeObjectURL(url);
        }
    });
}

async function loadMediaUrl(file: Attachment): Promise<string> {
    const blob = await fetchAttachment(file.id);

    return URL.createObjectURL(blob.slice(0, blob.size, file.mime));
}

export function useAttachmentMedia(file: Attachment, enabled: boolean) {
    const client = useQueryClient();
    const queryKey = queryKeys.attachmentMedia(file.id);

    useEffect(() => {
        revokeEvictedMedia(client);
    }, [client]);

    return useQuery({
        queryKey,
        queryFn: async () => client.getQueryData<string>(queryKey) ?? loadMediaUrl(file),
        enabled,
        staleTime: Infinity,
        gcTime: MEDIA_CACHE_MS,
        refetchOnWindowFocus: false,
    });
}
