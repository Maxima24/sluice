'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { ccc } from '@ckb-ccc/connector-react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            gcTime: 5 * 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: { retry: 0 },
        },
      }),
  );

  // The FNN node runs on testnet (its chainHash); default the wallet client to
  // match. Override via NEXT_PUBLIC_CKB_NETWORK=mainnet if ever needed.
  const ckbClient = useMemo(
    () =>
      process.env.NEXT_PUBLIC_CKB_NETWORK === 'mainnet'
        ? new ccc.ClientPublicMainnet()
        : new ccc.ClientPublicTestnet(),
    [],
  );

  return (
    <QueryClientProvider client={client}>
      <ccc.Provider name="Fiber Liquidity Layer" defaultClient={ckbClient}>
        {children}
      </ccc.Provider>
    </QueryClientProvider>
  );
}
