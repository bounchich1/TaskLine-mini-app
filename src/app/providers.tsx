import { MaxUI, useSystemColorScheme } from '@maxhub/max-ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { useEffect, type ReactNode } from 'react';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: 1, staleTime: 10000, refetchOnWindowFocus: true },
        mutations: { retry: false },
    },
});

export function Providers({ children }: { children: ReactNode }) {
    const scheme = useSystemColorScheme({ listenChanges: true });

    useEffect(() => {
        document.documentElement.dataset.scheme = scheme;
    }, [scheme]);

    return (
        <MaxUI colorScheme={scheme} className={clsx('app-root', scheme === 'dark' && 'app-root--dark')}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </MaxUI>
    );
}
