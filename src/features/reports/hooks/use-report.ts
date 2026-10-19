import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { api } from '@/shared/api/http';
import { queryKeys } from '@/shared/api/query-keys';

import type { ReportRange } from '../model/period';
import type { ReportByName, ReportName } from '../model/types';

const REFRESH_MS = 60000;

export function useReport<Name extends ReportName>(name: Name, range: ReportRange) {
    return useQuery({
        queryKey: queryKeys.report(name, range.from, range.to),
        queryFn: ({ signal }) =>
            api<ReportByName[Name]>(`/v1/reports/${name}?from=${range.from}&to=${range.to}`, { signal }),
        placeholderData: keepPreviousData,
        refetchInterval: REFRESH_MS,
    });
}
