'use client';

import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, optimism, arbitrum, polygon, base, bsc } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider, getDefaultConfig } from 'connectkit';
import { SweepProvider } from '@/lib/context/SweepContext';

export const config = createConfig(
  getDefaultConfig({
    chains: [mainnet, optimism, arbitrum, polygon, base, bsc],
    transports: {
      [mainnet.id]: http(
        `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`
      ),
      [optimism.id]: http(
        `https://opt-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`
      ),
      [arbitrum.id]: http(
        `https://arb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`
      ),
      [polygon.id]: http(
        `https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`
      ),
      [base.id]: http(
        `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`
      ),
      [bsc.id]: http('https://bsc-dataseed.binance.org'),
    },
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? '',
    appName: 'CryptoSweep',
    appDescription: 'Discover & Convert Idle Crypto Assets',
    // appUrl: "https://crypto-sweep.vercel.app/", // your app's url
    // appIcon: "https://crypto-sweep.vercel.app/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
  })
);

const queryClient = new QueryClient();

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>
          <SweepProvider>{children}</SweepProvider>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
