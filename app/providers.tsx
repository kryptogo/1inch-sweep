'use client';

import { createClient, http } from 'viem';
import { createConfig, WagmiProvider } from 'wagmi';
import { mainnet, arbitrum, polygon, bsc } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SweepProvider } from '@/lib/context/SweepContext';

const queryClient = new QueryClient();

const config = createConfig({
  chains: [mainnet, arbitrum, polygon, bsc],
  client({ chain }: any) {
    return createClient({ chain, transport: http() });
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <SweepProvider>{children}</SweepProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
