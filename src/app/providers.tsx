import { MaxUI } from '@maxhub/max-ui';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 10000, refetchOnWindowFocus: true },
    mutations: { retry: false },
  },
});

/** MAX UI theme and the query cache. `app-root` sets the app font (base/_max-ui-overrides.scss). */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <MaxUI className="app-root">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </MaxUI>
  );
}
