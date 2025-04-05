import { Chain as ViemChain } from 'viem';

export interface Chain extends ViemChain {
  rpcUrl: string;
}

export interface Token {
  address: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
}

export interface Asset {
  id: string;
  chain: Chain;
  tokenAddress: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  balance: string;
  amount: number;
  value: number;
  walletAddress: string;
}
