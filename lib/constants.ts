import { bsc, polygon, arbitrum, optimism, base, mainnet } from 'viem/chains';
import { Token } from './types';

export const SUPPORTED_CHAINS = [
  // mainnet, // Keep Ethereum commented out if not yet supported in UI/API calls
  bsc,
  polygon,
  arbitrum,
  optimism,
  base,
];

export const MOCK_DORMANT_ASSETS = [
  {
    id: 1,
    chain: 'ethereum',
    token: 'ETH',
    amount: 0.012,
    value: 28.56,
    tokenIcon: '/images/tokens/eth.svg',
  },
  {
    id: 2,
    chain: 'polygon',
    token: 'LINK',
    amount: 5.2,
    value: 62.4,
    tokenIcon: '/images/tokens/link.svg',
  },
  {
    id: 3,
    chain: 'bsc',
    token: 'CAKE',
    amount: 2.5,
    value: 7.25,
    tokenIcon: '/images/tokens/cake.svg',
  },
  {
    id: 4,
    chain: 'base',
    token: 'USDC',
    amount: 10.0,
    value: 10.0,
    tokenIcon: '/images/tokens/usdc.svg',
  },
  {
    id: 5,
    chain: 'arbitrum',
    token: 'ARB',
    amount: 12.0,
    value: 16.8,
    tokenIcon: '/images/tokens/arb.svg',
  },
  {
    id: 6,
    chain: 'optimism',
    token: 'OP',
    amount: 8.5,
    value: 21.25,
    tokenIcon: '/images/tokens/op.svg',
  },
];

export const STABLECOIN_OPTIONS: Record<number, Token[]> = {
  1: [
    {
      address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      symbol: 'USDT',
      decimals: 6,
    },
    {
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      symbol: 'USDC',
      decimals: 6,
    },
  ],
  56: [
    {
      address: '0x55d398326f99059ff775485246999027b3197955',
      symbol: 'USDT',
      decimals: 18,
    },
    {
      address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
      symbol: 'USDC',
      decimals: 18,
    },
  ],
  137: [
    {
      address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
      symbol: 'USDT',
      decimals: 6,
    },
    {
      address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
      symbol: 'USDC',
      decimals: 6,
    },
  ],
  42161: [
    {
      address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
      symbol: 'USDT',
      decimals: 6,
    },
    {
      address: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
      symbol: 'USDC',
      decimals: 6,
    },
  ],
  10: [
    {
      address: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
      symbol: 'USDT',
      decimals: 6,
    },
    {
      address: '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
      symbol: 'USDC',
      decimals: 6,
    },
  ],
  8453: [
    {
      address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
      symbol: 'USDC',
      decimals: 6,
    },
  ],
};

// Native token options for destination
export const NATIVE_TOKEN_OPTIONS: Record<number, Token> = {
  1: {
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'ETH',
    decimals: 18,
  },
  56: {
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'BNB',
    decimals: 18,
  },
  137: {
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'MATIC',
    decimals: 18,
  },
  42161: {
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'ETH',
    decimals: 18,
  },
  10: {
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'ETH',
    decimals: 18,
  },
  8453: {
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'ETH',
    decimals: 18,
  },
};

export const CHAIN_INDEX_MAP: Record<string, string> = {
  ethereum: '1',
  polygon: '137',
  bsc: '56',
  arbitrum: '42161',
  optimism: '10',
  base: '8453',
};

export const SERVICE_FEE_PERCENTAGE = 1; // 1%
export const MINIMUM_FEE_USD = 0.1; // $0.1

// Define logo URLs for main tokens (native tokens) for each chain
export const MAIN_TOKEN_LOGOS: Record<string, { symbol: string; logoUrl: string }> = {
  ethereum: {
    symbol: 'ETH',
    logoUrl: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
  },
  binance: {
    symbol: 'BNB',
    logoUrl: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
  },
  bsc: {
    symbol: 'BNB',
    logoUrl: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
  },
  polygon: {
    symbol: 'POL',
    logoUrl: 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png',
  },
  avalanche: {
    symbol: 'AVAX',
    logoUrl:
      'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png',
  },
  arbitrum: {
    symbol: 'ETH',
    logoUrl: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
  },
  arb: {
    symbol: 'ETH',
    logoUrl: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
  },
  optimism: {
    symbol: 'ETH',
    logoUrl: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
  },
  base: {
    symbol: 'ETH',
    logoUrl: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
  },
  solana: {
    symbol: 'SOL',
    logoUrl: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',
  },
};
