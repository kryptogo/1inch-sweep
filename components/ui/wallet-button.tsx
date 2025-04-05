'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WalletButtonProps {
  walletId: string;
  name: string;
  onClick: () => void;
  className?: string;
}

export function WalletButton({ walletId, name, onClick, className }: WalletButtonProps) {
  return (
    <Button
      variant="outline"
      className={cn('flex items-center gap-2 h-14 w-full justify-start px-4', className)}
      onClick={onClick}
    >
      <div className="relative h-8 w-8">
        <Image
          src={`/images/wallets/${walletId}.svg`}
          alt={`${name} wallet`}
          fill
          className="object-contain"
        />
      </div>
      <span className="font-medium">{name}</span>
    </Button>
  );
}