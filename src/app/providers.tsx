import { MaxUI } from '@maxhub/max-ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 10000, refetchOnWindowFocus: true },
    mutations: { retry: false },
  },
});

/** MAX UI theme and the query cache. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <MaxUI>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </MaxUI>
  );
}
