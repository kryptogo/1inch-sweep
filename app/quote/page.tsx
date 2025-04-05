'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ProgressSteps } from '@/components/ui/progress-steps';
import { TooltipHelper } from '@/components/ui/tooltip-helper';
import { ChainIcon } from '@/components/ui/chain-icon';
import { TokenIcon } from '@/components/ui/token-icon';
import { NATIVE_TOKEN_OPTIONS, STABLECOIN_OPTIONS } from '@/lib/constants';
import { formatCurrency } from '@/lib/mock-data';
import { ArrowRight, AlertCircle, Clock, ArrowDown, CheckCircle } from 'lucide-react';
import { ConnectKitButton } from 'connectkit';
import { useAccount } from 'wagmi';
import { useSweep } from '@/lib/context/SweepContext';
import { formatNumber } from '@/lib/utils';
import { getFusionQuote } from '@/lib/api/1inch-api';
import { Token } from '@/lib/types';

export default function QuotePage() {
  const { address } = useAccount();
  const router = useRouter();
  const { selectedAssetIds, selectedAssets, destinationChain, destinationToken, totalValue } =
    useSweep();

  const [isLoading, setIsLoading] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      router.push('/');
    }

    // Redirect to scan page if no assets are selected
    if (selectedAssetIds.length === 0) {
      router.push('/scan');
    }
  }, [address, router, selectedAssetIds]);

  useEffect(() => {
    const fetchQuote = async () => {
      if (!selectedAssets.length || !destinationChain || !destinationToken) {
        console.log('Missing required parameters:', {
          selectedAssets: selectedAssets.length,
          destinationChain,
          destinationToken,
        });
        return;
      }

      // 目前只支持單個資產轉換
      if (selectedAssets.length > 1) {
        setError('Currently only supports single asset conversion');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const fromAsset = selectedAssets[0];
        const fromAssets = [
          {
            tokenAddress: fromAsset.tokenAddress || '0x0000000000000000000000000000000000000000',
            amount: fromAsset.balance,
          },
        ];

        console.log('Fetching quote with params:', {
          fromAssets,
          toTokenAddress: destinationToken.address,
          toChainId: destinationChain.id,
          walletAddress: address,
        });

        const quote = await getFusionQuote({
          fromAssets,
          toTokenAddress: destinationToken.address,
          toChainId: destinationChain.id,
          walletAddress: address as string,
        });

        setQuote(quote);
      } catch (err) {
        console.error('Error fetching quote:', err);
        setError('Failed to fetch quote. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuote();
  }, [selectedAssets, destinationChain, destinationToken, address]);

  const handleProceed = async () => {
    if (!quote) return;

    setIsLoading(true);
    try {
      // TODO: Implement transaction submission
      router.push('/transaction');
    } catch (err) {
      console.error('Error submitting transaction:', err);
      setError('Failed to submit transaction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/destination');
  };

  const destinationTokenInfo: Token | undefined = destinationChain?.id
    ? STABLECOIN_OPTIONS[destinationChain.id]?.find(
        (token) => token.symbol === destinationToken?.symbol
      ) ?? NATIVE_TOKEN_OPTIONS[destinationChain.id]
    : undefined;

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
            <h1 className="text-2xl font-bold text-blue-900">Quote Details</h1>
            <p className="mt-1 text-gray-600">Review and confirm your asset conversion details.</p>

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 p-4 text-red-800">
                <AlertCircle className="mr-2 inline-block h-5 w-5" />
                {error}
              </div>
            )}

            {isLoading && !quote ? (
              <div className="mt-8 flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                  <p className="text-gray-600">Fetching quote...</p>
                </div>
              </div>
            ) : quote ? (
              <div className="mt-8">
                <h2 className="text-lg font-medium">Conversion Summary</h2>
                <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-6">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-blue-800">Converting From:</p>
                      {selectedAssets.map((asset) => (
                        <div
                          key={asset.id}
                          className="flex items-center justify-between rounded-lg bg-white p-3"
                        >
                          <div className="flex items-center gap-2">
                            <ChainIcon chainId={String(asset.chain.id)} size="sm" />
                            <TokenIcon tokenId={asset.symbol} tokenUrl={asset.logoURI} size="sm" />
                            <span className="text-gray-900">
                              {formatNumber(asset.amount)} {asset.symbol}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(asset.value ?? 0)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-center">
                      <div className="rounded-full bg-blue-100 p-2">
                        <ArrowDown className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-blue-800">Converting To:</p>
                      <div className="mt-3 flex items-center justify-between rounded-lg bg-white p-3">
                        <div className="flex items-center gap-2">
                          <ChainIcon chainId={String(destinationChain?.id || '')} size="sm" />
                          <TokenIcon
                            tokenId={destinationToken?.symbol || ''}
                            tokenUrl={destinationToken?.logoURI}
                            size="sm"
                          />
                          <span className="text-gray-900">
                            {destinationTokenInfo?.symbol || ''}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(quote.toTokenAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h2 className="text-lg font-medium">Transaction Details</h2>
                  <div className="mt-4 rounded-lg border p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Asset Value</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(totalValue)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-600">Service Fee</span>
                          <TooltipHelper text="Fee applied to all conversions" />
                        </div>
                        <span className="font-medium text-gray-900">
                          -{formatCurrency(quote.protocolFee)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Network Gas Fees</span>
                        <span className="font-medium text-green-600">Covered by CryptoSweep</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-medium text-gray-900">You Will Receive</span>
                        <span className="font-bold text-gray-900">
                          {formatCurrency(quote.toTokenAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
                    <Clock className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Estimated Completion Time:</span> 2-5 minutes,
                      depending on network conditions.
                    </div>
                  </div>

                  <div className="flex items-start gap-2 rounded-lg bg-green-50 p-4 text-sm text-green-800">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Non-Custodial Process:</span> Your assets remain
                      in your control during the entire conversion process.
                    </div>
                  </div>

                  <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <div>
                      <span className="font-medium">Important:</span> Please keep this page open
                      until the transaction is complete.
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-between">
              <Button variant="outline" onClick={handleBack} disabled={isLoading}>
                Back
              </Button>
              <Button onClick={handleProceed} disabled={isLoading || !quote} className="gap-2">
                {isLoading ? (
                  <>
                    <span className="animate-pulse">Processing...</span>
                  </>
                ) : (
                  <>
                    Proceed with Conversion
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
