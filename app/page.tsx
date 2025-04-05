'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Shield, Wallet, Coins, ArrowRight, RefreshCw } from 'lucide-react';
import { ConnectKitButton } from 'connectkit';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';

export default function Home() {
  const { address, addresses } = useAccount();
  const [connectedWallets, setConnectedWallets] = useState<string[]>([]);

  // Update connected wallets when account changes
  useEffect(() => {
    if (addresses && addresses.length > 0) {
      setConnectedWallets([...addresses]); // Convert readonly array to mutable array
    } else if (address) {
      setConnectedWallets([address]);
    } else {
      setConnectedWallets([]);
    }
  }, [address, addresses]);

  const router = useRouter();
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

      <main className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-between gap-16 md:flex-row">
          <div className="max-w-xl">
            <h1 className="text-4xl font-bold leading-tight text-blue-900 md:text-5xl">
              Sweep Your Idle Crypto
            </h1>
            <p className="mt-4 text-lg text-gray-600 md:text-xl">
              Discover and convert your unused crypto assets across multiple blockchains into your
              preferred stable coin.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              {address ? (
                <>
                  <Button size="lg" asChild className="gap-2">
                    <Link href="/scan">
                      <Wallet className="h-5 w-5" />
                      Scan {connectedWallets.length} Wallets
                    </Link>
                  </Button>
                </>
              ) : (
                <ConnectKitButton />
              )}
              <Button size="lg" variant="outline" asChild>
                <Link href="#how-it-works" className="gap-2">
                  <RefreshCw className="h-5 w-5" />
                  How It Works
                </Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">Secure & Non-Custodial</span>
              </div>
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">Don&apos;t Need Gas Fee</span>
              </div>
            </div>
          </div>
          <div className="relative h-[400px] w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="absolute -top-6 -right-6 rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white">
              Average Gain: $50-$200
            </div>
            <div className="space-y-6">
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                <h3 className="font-medium text-blue-800">Ethereum</h3>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-gray-900">0.012 ETH</span>
                  <span className="font-medium text-gray-900">$28.56</span>
                </div>
              </div>
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                <h3 className="font-medium text-blue-800">Polygon</h3>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-gray-900">5.2 LINK</span>
                  <span className="font-medium text-gray-900">$62.40</span>
                </div>
              </div>
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                <h3 className="font-medium text-blue-800">Arbitrum</h3>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-gray-900">10 USDC</span>
                  <span className="font-medium text-gray-900">$10.00</span>
                </div>
              </div>
              <Button className="w-full gap-2" onClick={() => address && router.push('/scan')}>
                Convert to Stable coin
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <section id="how-it-works" className="mt-24">
          <h2 className="text-center text-3xl font-bold text-blue-900">How It Works</h2>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Wallet className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">1. Connect Wallet</h3>
              <p className="mt-2 text-gray-600">
                Securely connect your wallet to scan for unused assets across multiple blockchains.
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <RefreshCw className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">2. Discover Assets</h3>
              <p className="mt-2 text-gray-600">
                We scan multiple chains to find assets that haven&apos;t been moved in over 6
                months.
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Coins className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">3. Convert to Stable coin</h3>
              <p className="mt-2 text-gray-600">
                Select which assets to convert and receive USDC or USDT on your preferred chain.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-24 rounded-xl bg-blue-900 p-8 text-white">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div>
              <h2 className="text-2xl font-bold">Ready to find your unused crypto?</h2>
              <p className="mt-2 text-blue-100">
                Connect your wallet now and discover forgotten assets in seconds.
              </p>
            </div>
            {address ? (
              <Button size="lg" variant="secondary" asChild>
                <Link href="/scan">
                  <Wallet className="mr-2 h-5 w-5" />
                  Scan Wallet
                </Link>
              </Button>
            ) : (
              <ConnectKitButton />
            )}
          </div>
        </section>
      </main>

      <footer className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Image src="/images/logo.svg" alt="CryptoSweep Logo" width={32} height={32} />
              <span className="text-lg font-medium text-blue-700">CryptoSweep</span>
            </div>
            <div className="flex gap-6">
              <Link href="/terms" className="text-sm text-gray-600 hover:text-blue-600">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-sm text-gray-600 hover:text-blue-600">
                Privacy Policy
              </Link>
              <Link href="/faq" className="text-sm text-gray-600 hover:text-blue-600">
                FAQ
              </Link>
            </div>
            <div className="text-sm text-gray-500">2025 CryptoSweep. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
