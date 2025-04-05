'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ProgressSteps } from '@/components/ui/progress-steps';
import { LoadingAnimation } from '@/components/ui/loading-animation';
import { CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { ConnectKitButton } from 'connectkit';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { useSweep } from '@/lib/context/SweepContext';
import { Button } from '@/components/ui/button';
import { createWalletClient, custom } from 'viem';
import { toast } from 'sonner';
import { config } from '../web3-providers';
import { submitFusionOrder } from '@/lib/api/1inch-api';

export default function TransactionPage() {
  const router = useRouter();
  const { address } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const chainId = useChainId();
  const { selectedAssets, destinationChain, destinationToken, quote } = useSweep();

  // Transaction states
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [transactionStatus, setTransactionStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Redirect if no address or no selected assets
  useEffect(() => {
    if (!address) {
      router.push('/');
      return;
    }

    if (selectedAssets.length === 0) {
      router.push('/scan');
      return;
    }

    if (!quote) {
      router.push('/quote');
      return;
    }
  }, [address, router, selectedAssets, quote]);

  // Process transaction
  useEffect(() => {
    const processTransaction = async () => {
      if (!address || !quote || isProcessing) return;

      try {
        setIsProcessing(true);
        setError(null);
        setCurrentStep(0);

        // Step 1: Switch to source chain
        setTransactionStatus('Switching to source chain...');
        await switchChainAsync({ chainId: selectedAssets[0].chain.id });

        // Step 2: Submit transaction
        setCurrentStep(1);
        setTransactionStatus('Submitting transaction...');

        const walletClient = createWalletClient({
          chain: {
            ...selectedAssets[0].chain,
            rpcUrls: {
              default: {
                http: [selectedAssets[0].chain.rpcUrl],
              },
            },
          },
          transport: custom(window.ethereum),
        });

        const result = await submitFusionOrder({
          quote,
          walletClient,
          fromAddress: address,
        });

        if (result.txHash) {
          setTransactionStatus('Transaction submitted successfully!');
          setIsComplete(true);
        } else {
          throw new Error('Failed to submit transaction');
        }
      } catch (err) {
        console.error('Error in transaction process:', err);
        setError(err instanceof Error ? err.message : 'Failed to process transaction');
      } finally {
        setIsProcessing(false);
      }
    };

    processTransaction();
  }, [address, quote, selectedAssets, switchChainAsync, isProcessing]);

  const handleBack = () => {
    router.push('/quote');
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
            currentStep={3}
            className="mb-12"
          />

          <div className="rounded-xl border bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-blue-900">Transaction Status</h1>
            <p className="mt-1 text-gray-600">Processing your asset conversion.</p>

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 p-4 text-red-800">
                <AlertCircle className="mr-2 inline-block h-5 w-5" />
                {error}
              </div>
            )}

            <div className="mt-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      currentStep >= 0 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    1
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Switch Network</p>
                    <p className="text-sm text-gray-500">
                      {currentStep === 0 ? transactionStatus : 'Completed'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      currentStep >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    2
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Submit Transaction</p>
                    <p className="text-sm text-gray-500">
                      {currentStep === 1
                        ? transactionStatus
                        : currentStep > 1
                        ? 'Completed'
                        : 'Pending'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {isComplete && (
              <div className="mt-8 rounded-lg bg-green-50 p-4 text-green-800">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Transaction completed successfully!</span>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-end">
              {!isComplete && (
                <Button variant="outline" onClick={handleBack} disabled={isProcessing}>
                  Back
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
