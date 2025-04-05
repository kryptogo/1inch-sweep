'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface TokenIconProps {
  tokenId?: string;
  tokenUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function TokenIcon({ tokenId, tokenUrl, size = 'md', className }: TokenIconProps) {
  const sizeClasses = {
    xs: 'h-4 w-4',
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  // Determine the source URL
  const src =
    tokenUrl ||
    (tokenId ? `/images/tokens/${tokenId.toLowerCase()}.svg` : '/images/tokens/generic-token.svg');

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      <Image
        src={src}
        alt={tokenId ? `${tokenId} token` : 'Token'}
        fill
        className="object-contain"
        onError={(e) => {
          // Fallback to a generic token icon if the image fails to load
          const target = e.target as HTMLImageElement;
          target.src = '/images/tokens/generic-token.svg';
        }}
      />
    </div>
  );
}
