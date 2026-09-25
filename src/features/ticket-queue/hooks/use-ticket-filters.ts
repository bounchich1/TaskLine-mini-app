import { useEffect, useMemo, useState } from 'react';

import { DEFAULT_FILTERS, FILTER_FIELDS, filtersQuery, type Filters, type QueueTab } from '../model/filter-defaults';

const SEARCH_DEBOUNCE_MS = 300;

export function useTicketFilters(timezone: string) {
    const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
    const [search, setSearch] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters((current) => ({ ...current, q: search }));
        }, SEARCH_DEBOUNCE_MS);

        return () => {
            clearTimeout(timer);
        };
    }, [search]);

    const query = useMemo(() => filtersQuery(filters, timezone), [filters, timezone]);

    return {
        filters,
        query,
        activeFilters: FILTER_FIELDS.filter((field) => filters[field]).length,
        search,
        setSearch,
        filterOpen,
        toggleFilters: () => {
            setFilterOpen(!filterOpen);
        },
        change: (name: keyof Filters, value: string) => {
            setFilters((current) => ({ ...current, [name]: value }));
        },
        selectTab: (tab: QueueTab) => {
            setFilters((current) => ({ ...current, tab, status: '' }));
        },
        reset: () => {
            setFilters({ ...DEFAULT_FILTERS, tab: filters.tab });
            setSearch('');
        },
    };
}

export type TicketFilters = ReturnType<typeof useTicketFilters>;
