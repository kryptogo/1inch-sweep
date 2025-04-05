'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ProgressSteps } from '@/components/ui/progress-steps';
import { TokenIcon } from '@/components/ui/token-icon';
import { ChainIcon } from '@/components/ui/chain-icon';
import { formatCurrency } from '@/lib/mock-data';
import { CheckCircle, Share2, Download, RefreshCw, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { ConnectKitButton } from 'connectkit';
import { useAccount } from 'wagmi';
import { useSweep } from '@/lib/context/SweepContext';
import { calculateServiceFee, calculateFinalAmount } from '@/lib/mock-data';
import { SUPPORTED_CHAINS } from '@/lib/constants';
import { Chain, Token } from '@/lib/types';

export default function SuccessPage() {
  const { address } = useAccount();
  const router = useRouter();
  const { totalValue, destinationChain, destinationToken, selectedAssetIds } = useSweep();

  useEffect(() => {
    if (!address) {
      router.push('/');
    }

    // Redirect to scan page if no assets were selected
    if (selectedAssetIds.length === 0) {
      router.push('/scan');
    }
  }, [address, router, selectedAssetIds]);

  const [showDownloadPrompt, setShowDownloadPrompt] = useState(false);

  // Calculate values from context data
  const serviceFee = calculateServiceFee(totalValue);
  const finalAmount = calculateFinalAmount(totalValue);

  // Get chain display name
  const chainInfo = SUPPORTED_CHAINS.find((chain) => chain.id === (destinationChain?.id || 0));
  const chainDisplayName = chainInfo ? chainInfo.name : 'Unknown Network';

  // Ensure destinationChain and destinationToken are properly handled
  const safeDestinationChain = destinationChain ? String(destinationChain.id) : '1';
  const safeDestinationToken = destinationToken?.symbol || 'USDT';

  // Transaction details
  // const transactionDetails = {
  //   transactionId: '0x' + Math.random().toString(16).substring(2, 30),
  //   timestamp: new Date().toISOString(),
  // };

  const handleShare = () => {
    toast.success('Share link copied to clipboard!');
  };

  const handleDownload = () => {
    toast.success('Transaction record downloaded!');
  };

  const handleDownloadWallet = () => {
    setShowDownloadPrompt(true);
  };

  const handleScanAgain = () => {
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
            currentStep={4}
            className="mb-12"
          />

          <div className="rounded-xl border bg-white p-8 shadow-sm">
            <div className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
              <h1 className="mt-4 text-center text-2xl font-bold text-blue-900">
                Conversion Successful!
              </h1>
              <p className="mt-2 text-center text-gray-600">
                Your unused assets have been successfully converted to stable coin.
              </p>
            </div>

            <div className="mt-8 rounded-lg border border-green-200 bg-green-50 p-6">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div>
                  <p className="text-sm text-gray-600">You received</p>
                  <div className="mt-1 flex items-center gap-2">
                    <TokenIcon tokenId={safeDestinationToken} />
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCurrency(finalAmount)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-green-300 bg-white px-4 py-2">
                  <ChainIcon chainId={safeDestinationChain} size="sm" />
                  <span className="font-medium text-gray-900">{chainDisplayName}</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900">Transaction Details</h2>
              <div className="mt-4 space-y-3 rounded-lg border p-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Asset Value</span>
                  <span className="font-medium text-gray-900">{formatCurrency(totalValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Fee (1%)</span>
                  <span className="font-medium text-gray-900">-{formatCurrency(serviceFee)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium text-gray-900">Final Amount</span>
                  <span className="font-bold text-gray-900">{formatCurrency(finalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="outline" className="flex-1 gap-2" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" className="flex-1 gap-2" onClick={handleDownload}>
                <Download className="h-4 w-4" />
                Download Record
              </Button>
              <Button variant="outline" className="flex-1 gap-2" onClick={handleScanAgain}>
                <RefreshCw className="h-4 w-4" />
                Scan Again
              </Button>
            </div>

            <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
              <h3 className="font-bold text-blue-900">Transaction Complete</h3>
              <p className="mt-2 text-sm text-blue-700">
                Your assets have been successfully swept to the destination wallet.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
