'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ProgressSteps } from '@/components/ui/progress-steps';
import { LoadingAnimation } from '@/components/ui/loading-animation';
import { ChainIcon } from '@/components/ui/chain-icon';
import { SUPPORTED_CHAINS } from '@/lib/constants';
import { formatCurrency } from '@/lib/mock-data';
import { Shield, ArrowRight, CheckSquare } from 'lucide-react';
import { ConnectKitButton } from 'connectkit';
import { useAccount } from 'wagmi';
import { AssetCard } from '@/components/ui/asset-card';
import { TooltipHelper } from '@/components/ui/tooltip-helper';
import { useSweep } from '@/lib/context/SweepContext';
import { fetch1inchTokenBalances, enrichAssetsWithMetadata, Asset } from '@/lib/api/1inch-api';

export default function ScanPage() {
  const { address, addresses } = useAccount();
  const router = useRouter();
  const [scanState, setScanState] = useState<'connecting' | 'scanning' | 'complete' | 'error'>(
    'connecting'
  );

  const {
    assets,
    setAssets,
    selectedAssetIds,
    toggleAssetSelection,
    selectAllAssets,
    deselectAllAssets,
    totalValue,
    connectedWallets,
    setConnectedWallets,
    currentScanningWallet,
    setCurrentScanningWallet,
    scannedWallets,
    setScannedWallets,
  } = useSweep();

  useEffect(() => {
    if (!address) {
      router.push('/');
    }
  }, [address, router]);

  // Simplified state for 1inch
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AbortController reference
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // Handle select/deselect all assets
  const handleSelectAll = () => {
    if (selectedAssetIds.length === assets.length) {
      deselectAllAssets();
    } else {
      selectAllAssets();
    }
  };

  // Calculate total available value (all assets)
  // Make sure value exists, default to 0 if undefined
  const totalAvailableValue = assets.reduce((sum, asset) => sum + (asset.value ?? 0), 0);

  const handleContinue = () => {
    if (selectedAssetIds.length > 0) {
      router.push('/destination');
    }
  };

  // Refactored data fetching logic for 1inch
  useEffect(() => {
    // Abort previous fetch if component re-renders or dependencies change
    if (abortController) {
      abortController.abort();
    }

    // Create a new AbortController for this fetch operation
    const controller = new AbortController();
    setAbortController(controller);
    const { signal } = controller;

    const fetchAllBalances = async () => {
      if (connectedWallets.length === 0) {
        setScanState('connecting'); // Or indicate waiting for wallet connection
        setIsLoading(false);
        setAssets([]); // Clear assets if no wallets are connected
        return;
      }

      setScanState('scanning');
      setIsLoading(true);
      setError(null);
      setScannedWallets([]); // Reset scanned wallets
      setCurrentScanningWallet(null); // Reset scanning indicator
      setAssets([]); // Clear previous assets

      const allFoundAssets: Asset[] = [];
      const walletsToScan = [...connectedWallets]; // Create a mutable copy

      try {
        // Step 1: Fetch basic balances for all wallets
        for (let i = 0; i < walletsToScan.length; i++) {
          const walletAddress = walletsToScan[i];
          setCurrentScanningWallet(walletAddress);

          if (signal.aborted) {
            console.log('Scan aborted before fetching for wallet:', walletAddress);
            throw new Error('Aborted');
          }

          console.log(
            `Fetching balances for wallet ${i + 1}/${walletsToScan.length}: ${walletAddress}`
          );
          const walletAssets = await fetch1inchTokenBalances(walletAddress, signal);
          allFoundAssets.push(...walletAssets);

          // Update scanned wallets state
          setScannedWallets((prev) => [...prev, walletAddress]);

          // Optional: Add a small delay even between wallets if hitting global rate limits
          // await wait(100); // e.g., 100ms delay
        }

        console.log(`Found ${allFoundAssets.length} raw assets. Now enriching...`);

        // Step 2: Enrich assets with metadata and prices
        // Update loading state to indicate enrichment phase if desired
        // setScanState('enriching'); // Example state

        const enrichedAndFilteredAssets = await enrichAssetsWithMetadata(allFoundAssets, signal);

        if (signal.aborted) {
          throw new Error('Aborted during enrichment');
        }

        setAssets(enrichedAndFilteredAssets);
        setScanState('complete');
      } catch (err: any) {
        if (err.message.startsWith('Aborted')) {
          console.log('Scan operation was aborted.');
          // Decide how to handle state on abort (clear assets? keep partials?)
        } else {
          console.error('Error during balance fetching or enrichment:', err);
          setError('Failed to fetch or process token balances. Please try again.');
          setScanState('error');
          // Show partially loaded/enriched data?
          // setAssets(allFoundAssets); // Or keep whatever was last successfully set
        }
      } finally {
        setIsLoading(false);
        setCurrentScanningWallet(null);
      }
    };

    fetchAllBalances();

    // Cleanup function
    return () => {
      console.log('Aborting scan page fetch operations.');
      controller.abort();
      setAbortController(null);
    };
    // Depend on connectedWallets to refetch when they change
  }, [connectedWallets, setAssets, setScannedWallets, setCurrentScanningWallet]);

  // Initialize connected wallets
  useEffect(() => {
    if (addresses && addresses.length > 0) {
      setConnectedWallets([...addresses]);
    } else if (address) {
      setConnectedWallets([address]);
    } else {
      setConnectedWallets([]); // Ensure it's cleared if no address/addresses
    }
  }, [address, addresses, setConnectedWallets]);

  // Determine scan progress percentage
  const scanProgress =
    connectedWallets.length > 0 ? (scannedWallets.length / connectedWallets.length) * 100 : 0;

  const isLoadingAssets = scanState === 'scanning' || isLoading;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="container mx-auto flex items-center justify-between py-6">
        <div className="flex items-center gap-2">
          <Image src="/images/logo.svg" alt="CryptoSweep" width={32} height={32} />
          <h1 className="text-xl font-bold text-gray-900">CryptoSweep</h1>
        </div>
        <ConnectKitButton />
      </header>

      <main className="container mx-auto pb-16 pt-8">
        <div className="mx-auto max-w-3xl">
          <ProgressSteps
            steps={['Scan Assets', 'Set Destination', 'Confirm Sweep']}
            currentStep={0}
          />

          <div className="mt-12">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Scan Wallet Assets</h2>
              {assets.length > 0 && (
                <Button
                  variant="link"
                  onClick={handleSelectAll}
                  className="px-0 text-blue-600 hover:text-blue-800"
                >
                  {selectedAssetIds.length === assets.length ? 'Deselect All' : 'Select All'}
                </Button>
              )}
            </div>

            {error && (
              <div className="mt-4 rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>
            )}

            {scanState === 'connecting' && !address && (
              <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-dashed bg-gray-50 p-12 text-center">
                <p className="text-gray-500">Please connect your wallet to begin scanning.</p>
                <ConnectKitButton />
              </div>
            )}

            {isLoadingAssets && address && (
              <div className="mt-8 flex flex-col items-center justify-center rounded-lg border bg-gray-50 p-12 text-center">
                <LoadingAnimation />
                <p className="mt-4 text-lg font-medium text-gray-900">Scanning your wallets...</p>
                {currentScanningWallet && (
                  <p className="mt-1 text-sm text-gray-500">
                    Checking:{' '}
                    {`${currentScanningWallet.substring(0, 6)}...${currentScanningWallet.substring(
                      currentScanningWallet.length - 4
                    )}`}
                  </p>
                )}
                <div className="mt-4 w-full max-w-xs">
                  {/* Simplified Progress Bar */}
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-blue-600 transition-all duration-300 ease-in-out"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-center text-xs text-gray-500">
                    {scannedWallets.length} / {connectedWallets.length} wallets scanned
                  </p>
                </div>
                {/* Display scanned chains if needed, could be removed for simplicity */}
                {/* <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {SUPPORTED_CHAINS.map((chain) => (
                    <TooltipHelper key={chain.id} message={chain.name}>
                      <ChainIcon
                        chainId={String(chain.id)}
                        className={cn(
                          'h-6 w-6 opacity-30 transition-opacity',
                          scannedWallets.length > 0 && 'opacity-100' // Example: Light up when scan starts
                        )}
                      />
                    </TooltipHelper>
                  ))}
                </div> */}
              </div>
            )}

            {!isLoadingAssets && assets.length === 0 && scanState === 'complete' && (
              <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-dashed bg-gray-50 p-12 text-center">
                <p className="text-lg font-medium text-gray-900">No swappable assets found.</p>
                <p className="mt-1 text-gray-500">
                  We couldn&apos;t find any supported tokens with a balance above the minimum
                  threshold ($1).
                </p>
              </div>
            )}

            {!isLoadingAssets && assets.length > 0 && (
              <div className="mt-6 space-y-3">
                {assets.map((asset) => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    isSelected={selectedAssetIds.includes(asset.id)}
                    onSelect={(selected) => toggleAssetSelection(asset.id, selected)}
                    walletInfo={
                      connectedWallets.length > 1
                        ? `${asset.walletAddress.substring(0, 6)}...`
                        : undefined
                    }
                  />
                ))}
              </div>
            )}

            {scanState === 'complete' && assets.length > 0 && (
              <div className="mt-8 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 flex-shrink-0 text-yellow-500" />
                  <div>
                    <h3 className="font-medium text-yellow-800">MEV Protection Enabled</h3>
                    <p className="text-sm text-yellow-700">
                      Swaps via 1inch Fusion provide protection against Maximal Extractable Value
                      (MEV).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {scanState !== 'connecting' && (
              <div className="mt-12 flex items-center justify-between border-t pt-8">
                <div>
                  <p className="text-sm text-gray-600">Total Selected Value</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
                </div>
                <Button
                  size="lg"
                  onClick={handleContinue}
                  disabled={selectedAssetIds.length === 0 || isLoadingAssets}
                  className="gap-2"
                >
                  Continue
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
