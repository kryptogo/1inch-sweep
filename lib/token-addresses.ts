// Stablecoin contract addresses for each chain
export const STABLECOIN_ADDRESSES: Record<string, Record<string, string>> = {
  eth: {
    usdt: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Ethereum USDT
    usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Ethereum USDC
    eth: 'eth',
  },
  bsc: {
    usdt: '0x55d398326f99059fF775485246999027B3197955', // BSC USDT
    usdc: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', // BSC USDC
    bsc: 'bsc',
  },
  matic: {
    usdt: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // Polygon USDT
    usdc: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', // Polygon USDC
    matic: 'matic',
  },
  arb: {
    usdt: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // Arbitrum USDT
    usdc: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // Arbitrum USDC
    eth: 'eth',
  },
  optimism: {
    usdt: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', // Optimism USDT
    usdc: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', // Optimism USDC
    eth: 'eth',
  },
  base: {
    usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base USDC
    eth: 'eth',
  },
};

// Chain ID mapping from internal to API format
export const CHAIN_ID_TO_API_FORMAT: Record<string, string> = {
  eth: 'eth',
  ethereum: 'eth',
  matic: 'matic',
  polygon: 'matic',
  bsc: 'bsc',
  arbitrum: 'arb',
  optimism: 'optimism',
  base: 'base',
};
