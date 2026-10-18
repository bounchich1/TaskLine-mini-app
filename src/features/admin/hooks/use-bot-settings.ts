import { useQuery } from '@tanstack/react-query';

import { api } from '@/shared/api/http';
import { queryKeys } from '@/shared/api/query-keys';

import type { BotSettings } from '../model/types';

export function useBotSettings() {
    return useQuery({ queryKey: queryKeys.adminBot, queryFn: () => api<BotSettings>('/v1/admin/bot') });
}
