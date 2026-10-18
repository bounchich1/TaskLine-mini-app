import { useQuery } from '@tanstack/react-query';

import { api } from '@/shared/api/http';
import { queryKeys } from '@/shared/api/query-keys';

import type { Preset, PresetPreview } from '../model/types';

export function usePresets() {
    return useQuery({
        queryKey: queryKeys.adminPresets,
        queryFn: () => api<{ items: Preset[]; current: string | null }>('/v1/admin/presets'),
    });
}

export function usePresetPreview(id: string) {
    return useQuery({
        queryKey: queryKeys.presetPreview(id),
        queryFn: () => api<PresetPreview>(`/v1/admin/presets/${id}/preview`),
        enabled: id !== '',
    });
}
