'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ProgressSteps } from '@/components/ui/progress-steps';
import { TooltipHelper } from '@/components/ui/tooltip-helper';
import { ChainIcon } from '@/components/ui/chain-icon';
import { TokenIcon } from '@/components/ui/token-icon';
import { SUPPORTED_CHAINS, STABLECOIN_OPTIONS, NATIVE_TOKEN_OPTIONS } from '@/lib/constants';
import { ArrowRight, Wallet, AlertCircle } from 'lucide-react';
import { ConnectKitButton } from 'connectkit';
import { useAccount } from 'wagmi';
import { useSweep } from '@/lib/context/SweepContext';
import { Chain, Token } from '@/lib/types';

export default function DestinationPage() {
  const { address } = useAccount();
  const router = useRouter();
  const {
    selectedAssets,
    destinationChain,
    setDestinationChain,
    destinationToken,
    setDestinationToken,
  } = useSweep();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      router.push('/');
    }

    if (selectedAssets.length === 0) {
      router.push('/scan');
    }
  }, [address, router, selectedAssets]);

  const handleChainSelect = (chainId: number) => {
    const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId);
    if (chain) {
      setDestinationChain({
        ...chain,
        rpcUrl: chain.rpcUrls.default.http[0],
      });
      setDestinationToken(null); // Reset token when chain changes
    }
  };

  const handleTokenSelect = (token: Token) => {
    setDestinationToken(token);
  };

  const handleProceed = () => {
    if (!destinationChain || !destinationToken) {
      setError('Please select both chain and token');
      return;
    }
    router.push('/quote');
  };

  const handleBack = () => {
    router.push('/scan');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="container mx-auto flex items-center justify-between py-6">
        <div className="flex items-center gap-2">
          <Image src="/images/logo.svg" alt="CryptoSweep Logo" width={40} height={40} />
          <span className="text-xl font-bold text-blue-700">CryptoSweep</span>
        </div>
        <div className="flex items-center gap-4">
          <ConnectKitButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <ProgressSteps
            steps={['Connect', 'Scan', 'Convert', 'Complete']}
            currentStep={2}
            className="mb-12"
          />

          <div className="rounded-xl border bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-blue-900">Select Destination</h1>
            <p className="mt-1 text-gray-600">Choose where to send your assets.</p>

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 p-4 text-red-800">
                <AlertCircle className="mr-2 inline-block h-5 w-5" />
                {error}
              </div>
            )}

            <div className="mt-8">
              <h2 className="text-lg font-medium">Select Chain</h2>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {SUPPORTED_CHAINS.map((chain) => (
                  <button
                    key={chain.id}
                    type="button"
                    className={`flex items-center gap-3 rounded-lg border p-4 ${
                      destinationChain?.id === chain.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/50 text-gray-700'
                    }`}
                    onClick={() => handleChainSelect(chain.id)}
                  >
                    <ChainIcon chainId={String(chain.id)} />
                    <span className="font-medium">{chain.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {destinationChain && (
              <div className="mt-8">
                <h2 className="text-lg font-medium">Select Token</h2>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <button
                    type="button"
                    className={`flex items-center gap-3 rounded-lg border p-4 ${
                      destinationToken?.address ===
                      NATIVE_TOKEN_OPTIONS[destinationChain.id].address
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/50 text-gray-700'
                    }`}
                    onClick={() => handleTokenSelect(NATIVE_TOKEN_OPTIONS[destinationChain.id])}
                  >
                    <TokenIcon tokenId={NATIVE_TOKEN_OPTIONS[destinationChain.id].symbol} />
                    <span className="font-medium">
                      {NATIVE_TOKEN_OPTIONS[destinationChain.id].symbol}
                    </span>
                  </button>

                  {STABLECOIN_OPTIONS[destinationChain.id]?.map((stablecoin) => (
                    <button
                      key={stablecoin.address}
                      type="button"
                      className={`flex items-center gap-3 rounded-lg border p-4 ${
                        destinationToken?.address === stablecoin.address
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/50 text-gray-700'
                      }`}
                      onClick={() => handleTokenSelect(stablecoin)}
                    >
                      <TokenIcon tokenId={stablecoin.symbol} />
                      <span className="font-medium">{stablecoin.symbol}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {destinationChain && destinationToken && (
              <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-600">
                <span>You will receive</span>
                <TokenIcon tokenId={destinationToken.symbol} size="sm" />
                <span className="font-medium">{destinationToken.symbol.toUpperCase()}</span>
                <span>on</span>
                <ChainIcon chainId={String(destinationChain.id)} size="sm" />
                <span className="font-medium">{destinationChain.name}</span>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-between">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleProceed} disabled={!destinationChain || !destinationToken}>
                Proceed
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
