'use client';

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { ChainIcon } from '@/components/ui/chain-icon';
import { TokenIcon } from '@/components/ui/token-icon';
import { formatCurrency } from '@/lib/mock-data';
import { cn, formatNumber } from '@/lib/utils';
import { Asset } from '@/lib/api/1inch-api';

interface AssetCardProps {
  asset: Asset;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  className?: string;
  walletInfo?: string;
}

export function AssetCard({ asset, isSelected, onSelect, className, walletInfo }: AssetCardProps) {
  return (
    <div
      className={cn(
        'flex cursor-pointer items-center gap-4 rounded-lg border bg-white p-4 transition-colors hover:bg-gray-50',
        isSelected && 'border-blue-500 bg-blue-50 hover:bg-blue-100',
        className
      )}
      onClick={() => onSelect(!isSelected)}
    >
      <Checkbox checked={isSelected} onCheckedChange={onSelect} />
      <TokenIcon tokenId={asset.symbol} tokenUrl={asset.logoURI} size="md" />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900">{asset.symbol || 'Unknown'}</span>
          <span className="font-semibold text-gray-900">{formatCurrency(asset.value ?? 0)}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            {formatNumber(asset.amount)} {asset.symbol}
          </span>
          <div className="flex items-center gap-1">
            <ChainIcon chainId={String(asset.chain.id)} size="sm" />
            <span>{asset.chain.name}</span>
          </div>
        </div>
        {walletInfo && <div className="mt-1 text-xs text-gray-400">Wallet: {walletInfo}</div>}
      </div>
    </div>
  );
}
