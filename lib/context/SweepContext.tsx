'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import { OKXAsset } from '../okx'; // Remove OKX import
import { Asset, Chain, Token } from '@/lib/types';
import { Quote } from '@/lib/api/1inch-api';

interface SweepContextType {
  // Assets state
  assets: Asset[]; // Use Asset type
  setAssets: (assets: Asset[]) => void;
  selectedAssetIds: string[]; // Use string for id (chainId-tokenAddress)
  setSelectedAssetIds: (ids: string[]) => void;

  // Destination state
  destinationChain: Chain | null;
  setDestinationChain: (chain: Chain | null) => void;
  destinationToken: Token | null;
  setDestinationToken: (token: Token | null) => void;
  destinationWallet: string | null;
  setDestinationWallet: (wallet: string | null) => void;

  // Computed values
  totalValue: number;
  selectedAssets: Asset[]; // Use Asset type

  // Connected wallets
  connectedWallets: string[];
  setConnectedWallets: (wallets: string[]) => void;
  currentScanningWallet: string | null;
  setCurrentScanningWallet: (wallet: string | null) => void;
  scannedWallets: string[];
  setScannedWallets: React.Dispatch<React.SetStateAction<string[]>>;

  // Helper functions
  selectAllAssets: () => void;
  deselectAllAssets: () => void;
  toggleAssetSelection: (id: string, selected: boolean) => void; // Use string for id

  quote: Quote | null;
  setQuote: (quote: Quote | null) => void;
}

const SweepContext = createContext<SweepContextType | undefined>(undefined);

export function SweepProvider({ children }: { children: ReactNode }) {
  // Assets state
  const [assets, setAssets] = useState<Asset[]>([]); // Use Asset type
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]); // Use string array for ids

  // Destination state
  const [destinationChain, setDestinationChain] = useState<Chain | null>(null);
  const [destinationToken, setDestinationToken] = useState<Token | null>(null);
  const [destinationWallet, setDestinationWallet] = useState<string | null>(null);

  // Connected wallets state
  const [connectedWallets, setConnectedWallets] = useState<string[]>([]);
  const [currentScanningWallet, setCurrentScanningWallet] = useState<string | null>(null);
  const [scannedWallets, setScannedWallets] = useState<string[]>([]);

  // Computed values
  const selectedAssets = assets
    .filter((asset) => selectedAssetIds.includes(asset.id)) // Use string id
    .sort((a, b) => {
      // Keep existing sort logic, adjust if needed based on Asset properties
      if (a.chain.id !== b.chain.id) return a.chain.name.localeCompare(b.chain.name); // Compare by chain name
      return (b.tokenAddress || '').localeCompare(a.tokenAddress || '');
    });
  // Ensure asset.value exists and is a number, default to 0 if undefined
  const totalValue = selectedAssets.reduce((sum, asset) => sum + (asset.value ?? 0), 0);

  // Helper functions
  const selectAllAssets = () => {
    setSelectedAssetIds(assets.map((asset) => asset.id)); // Use string id
  };

  const deselectAllAssets = () => {
    setSelectedAssetIds([]);
  };

  const toggleAssetSelection = (id: string, selected: boolean) => {
    // Use string id
    if (selected) {
      setSelectedAssetIds((prev) => [...prev, id]);
    } else {
      setSelectedAssetIds((prev) => prev.filter((assetId) => assetId !== id));
    }
  };

  // Reset state if needed (example)
  // useEffect(() => {
  //   // Reset logic if wallet disconnects, etc.
  // }, [/* dependencies */]);

  const [quote, setQuote] = useState<Quote | null>(null);

  const value: SweepContextType = {
    assets,
    setAssets,
    selectedAssetIds,
    setSelectedAssetIds,
    destinationChain,
    setDestinationChain,
    destinationToken,
    setDestinationToken,
    destinationWallet,
    setDestinationWallet,
    totalValue,
    selectedAssets,
    connectedWallets,
    setConnectedWallets,
    currentScanningWallet,
    setCurrentScanningWallet,
    scannedWallets,
    setScannedWallets,
    selectAllAssets,
    deselectAllAssets,
    toggleAssetSelection,
    quote,
    setQuote,
  };

  return <SweepContext.Provider value={value}>{children}</SweepContext.Provider>;
}

export function useSweep() {
  const context = useContext(SweepContext);
  if (context === undefined) {
    throw new Error('useSweep must be used within a SweepProvider');
  }
  return context;
}
