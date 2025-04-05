'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
// import { SUPPORTED_CHAINS } from '@/lib/constants'; // No longer needed here

// Create a manual mapping from numeric chain ID (string) to the image filename stem
const chainIdToFilenameMap: Record<string, string> = {
  '1': 'ethereum', // Assuming you have ethereum.svg if you re-enable mainnet
  '56': 'bsc',
  '137': 'polygon',
  '42161': 'arbitrum',
  '10': 'optimism',
  '8453': 'base',
  // Add other supported chain IDs and their corresponding image names here if needed
};

interface ChainIconProps {
  chainId: string; // Still accept the numeric ID as a string
  size?: 'sm' | 'md' | 'lg' | 'xs';
  className?: string;
}

export function ChainIcon({ chainId, size = 'md', className }: ChainIconProps) {
  const sizeClasses = {
    xs: 'h-4 w-4',
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  // Look up the filename using the map, fallback to the chainId itself if not found
  const chainFileName = chainIdToFilenameMap[chainId] || chainId;

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      <Image
        src={`/images/chains/${chainFileName}.svg`} // Use the mapped filename
        alt={`${chainFileName} chain`}
        fill
        className="object-contain"
        onError={(e) => {
          console.warn(`Failed to load chain icon: /images/chains/${chainFileName}.svg`);
          // Optionally hide the broken image
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    </div>
  );
}
