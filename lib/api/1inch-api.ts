import { Chain, Token, Asset as TypesAsset } from '@/lib/types';
import { SUPPORTED_CHAINS } from '../constants'; // Assuming you have chain details here
// import { wait } from './utils'; // Remove import

// Re-export Asset type
export type Asset = TypesAsset;

// Helper function to wait for a specified time
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Define the structure based on docs/wallet-scanning-and-swap-with-1inch.md
interface InchTokenBalance {
  address: string; // Token address
  balance: string; // Raw balance
  decimals: number;
  symbol: string;
  name: string;
  logoURI?: string; // Use logoURI as per 1inch API conventions
  price?: number; // Price might come from a different endpoint or need calculation
}

// Remove API key from client-side code
// const INCH_API_KEY = process.env.NEXT_PUBLIC_1INCH_API_KEY || '';

// Base URLs might still be useful for constructing non-balance calls later, or remove if unused client-side
const INCH_API_GENERAL_BASE_URL = 'https://api.1inch.dev';
const INCH_BALANCE_API_BASE_URL =
  process.env.NEXT_PUBLIC_1INCH_API_URL || 'https://api.1inch.dev/balance/v1.2';

// Interface for the price API response (adjust based on actual 1inch Spot Price API)
interface TokenPrices {
  [tokenAddress: string]: string; // Assuming price is returned as a string USD value
}

// Interface for a single token's metadata (adjust based on actual 1inch Token API)
interface TokenMetadata {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

// Fetch token balances by calling the Next.js API proxy route
export const fetch1inchTokenBalances = async (
  walletAddress: string,
  signal?: AbortSignal
): Promise<Asset[]> => {
  // Remove API key check from client-side
  if (!walletAddress) return [];

  const allAssets: Asset[] = [];
  console.log(
    'Fetching balances via proxy for:',
    walletAddress,
    'Supported chains:',
    SUPPORTED_CHAINS.length
  );

  const results = await Promise.allSettled(
    SUPPORTED_CHAINS.map(async (chain, index) => {
      // Keep rate limiting delay
      if (index > 0) {
        await wait(250);
      }

      if (signal?.aborted) {
        throw new Error('Aborted');
      }

      const chainId = chain.id;
      // Construct URL to the local API proxy route
      const proxyUrl = `/api/1inch/balances/${chainId}/${walletAddress}`;
      // Remove Authorization header from client-side fetch
      const headers = {
        accept: 'application/json',
      };

      try {
        console.log(`Fetching ${chain.name} (${chainId}) balances via proxy...`);
        // Fetch from the local proxy URL
        const response = await fetch(proxyUrl, { headers, signal });

        if (signal?.aborted) {
          throw new Error('Aborted');
        }

        // Check status code forwarded by the proxy
        if (response.status === 404) {
          console.log(`Proxy reported no balances for ${walletAddress} on ${chain.name}`);
          return [];
        }

        // Handle non-200 responses forwarded by the proxy
        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: 'Failed to parse proxy error response' }));
          console.warn(
            `Proxy error fetching balances for ${chain.name}: ${response.status}`,
            errorData.message || errorData.details || errorData
          );
          // Depending on the error (e.g., 429 rate limit), you might want to retry here or in the proxy
          throw new Error(
            `Proxy failed to fetch balances for chain ${chainId}: ${response.status} ${
              errorData.message || ''
            }`
          );
        }

        const balances: Record<string, string> = await response.json();
        console.log(`Raw balances for ${chain.name} from proxy:`, Object.keys(balances).length);

        // TODO: Fetch token metadata (name, symbol, decimals, price, logo) using another 1inch endpoint (like Token API) or a different service.
        // The basic balance endpoint only returns address -> balance mapping.
        // For now, creating partial Asset objects.

        const chainAssets: Asset[] = Object.entries(balances)
          .map(([tokenAddress, rawBalance]) => {
            const decimals = 18; // Still placeholder - enrichment needs to happen
            const amount = parseFloat(rawBalance) / 10 ** decimals;
            const asset: Asset = {
              id: `${chainId}-${tokenAddress}`,
              chain: {
                ...chain,
                rpcUrl: chain.rpcUrls.default.http[0],
              },
              tokenAddress: tokenAddress.toLowerCase(),
              symbol: 'UNKNOWN', // Placeholder
              name: 'Unknown Token', // Placeholder
              decimals: decimals,
              balance: rawBalance,
              amount: amount,
              value: 0, // Initialize with 0
              walletAddress: walletAddress.toLowerCase(),
            };
            return asset;
          })
          .filter((asset) => asset.amount > 0);

        console.log(`Processed ${chainAssets.length} assets for ${chain.name}`);
        return chainAssets;
      } catch (error: any) {
        if (error.message === 'Aborted') {
          console.log(`Fetch aborted for chain ${chainId}`);
        } else {
          console.error(
            `Error fetching balances via proxy for ${walletAddress} on chain ${chainId}:`,
            error.message
          );
        }
        return [];
      }
    })
  );

  // Collect successful results
  results.forEach((result) => {
    if (result.status === 'fulfilled' && result.value) {
      allAssets.push(...result.value);
    }
  });
  console.log(`Total raw assets found via proxy for ${walletAddress}: ${allAssets.length}`);
  return allAssets;
};

/**
 * Fetches metadata and prices for a list of assets.
 * Assumes 1inch Spot Price API v1.1 and a hypothetical Token Metadata endpoint.
 * Replace URLs and response handling based on actual 1inch documentation.
 */
export const enrichAssetsWithMetadata = async (
  assets: Asset[],
  signal?: AbortSignal
): Promise<Asset[]> => {
  if (assets.length === 0) return [];

  console.log(`Enriching ${assets.length} assets with metadata and prices...`);

  const assetsByChain: Record<string, Asset[]> = {};
  assets.forEach((asset) => {
    const chainId = String(asset.chain.id);
    if (!assetsByChain[chainId]) {
      assetsByChain[chainId] = [];
    }
    assetsByChain[chainId].push(asset);
  });

  const enrichedAssets: Asset[] = [];
  // Remove client-side API key usage here as well
  // const headers = {
  //   // Authorization: `Bearer ${INCH_API_KEY}`, // <-- REMOVE THIS
  //   accept: 'application/json',
  // };

  for (const chainId in assetsByChain) {
    if (signal?.aborted) throw new Error('Aborted');

    const chainAssets = assetsByChain[chainId];
    const tokenAddresses = chainAssets.map((a) => a.tokenAddress);

    // --- Batch Fetch Prices via Proxy ---
    const priceProxyUrl = `/api/1inch/prices/${chainId}`; // Use local proxy URL
    let prices: TokenPrices = {};
    try {
      console.log(
        `Fetching prices via proxy for ${tokenAddresses.length} tokens on chain ${chainId}...`
      );
      const priceResponse = await fetch(priceProxyUrl, {
        method: 'POST',
        // Use standard headers for POSTing JSON to our proxy
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify({ tokens: tokenAddresses }), // Send only tokens, proxy adds currency
        signal,
      });

      if (signal?.aborted) throw new Error('Aborted');

      console.log(`[Chain ${chainId}] Price Proxy Status:`, priceResponse.status); // Log proxy status

      if (priceResponse.ok) {
        prices = await priceResponse.json();
        console.log(`[Chain ${chainId}] Parsed Prices from Proxy:`, prices);
      } else {
        const errorData = await priceResponse.json().catch(() => ({})); // Try to get error details from proxy
        console.warn(
          `Price proxy failed for chain ${chainId}: ${priceResponse.status}`,
          errorData.message || errorData.details || ''
        );
      }
      await wait(250);
    } catch (err: any) {
      if (err.message === 'Aborted') throw err;
      console.error(`Error calling price proxy for chain ${chainId}:`, err.message);
    }

    // --- Fetch Metadata via Proxy (Individually) ---
    for (const asset of chainAssets) {
      if (signal?.aborted) throw new Error('Aborted');

      let metadata: Partial<TokenMetadata> = {};
      const NATIVE_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
      if (asset.tokenAddress !== NATIVE_ADDRESS) {
        const metadataProxyUrl = `/api/1inch/metadata/${chainId}/${asset.tokenAddress}`; // Use local proxy URL
        try {
          console.log(
            `Fetching metadata via proxy for ${asset.tokenAddress} on chain ${chainId}...`
          );
          // Use standard headers for GET request to our proxy
          const metaResponse = await fetch(metadataProxyUrl, {
            headers: { accept: 'application/json' },
            signal,
          });
          if (signal?.aborted) throw new Error('Aborted');

          console.log(`[Token ${asset.tokenAddress}] Metadata Proxy Status:`, metaResponse.status); // Log proxy status

          if (metaResponse.ok) {
            metadata = await metaResponse.json();
            console.log(`[Token ${asset.tokenAddress}] Parsed Metadata from Proxy:`, metadata);
          } else {
            const errorData = await metaResponse.json().catch(() => ({})); // Try to get error details
            console.warn(
              `Metadata proxy failed for ${asset.tokenAddress} on chain ${chainId}: ${metaResponse.status}`,
              errorData.message || errorData.details || ''
            );
          }
          await wait(100);
        } catch (err: any) {
          if (err.message === 'Aborted') throw err;
          console.error(
            `Error calling metadata proxy for ${asset.tokenAddress} on chain ${chainId}:`,
            err.message
          );
        }
      } else {
        // Handle native token metadata (e.g., ETH, MATIC, BNB)
        metadata = {
          address: NATIVE_ADDRESS,
          symbol: asset.chain.nativeCurrency?.symbol || 'NATIVE',
          name: asset.chain.nativeCurrency?.name || 'Native Token',
          decimals: asset.chain.nativeCurrency?.decimals || 18,
          // logoURI might need a lookup map
        };
        console.log(`[Token ${asset.tokenAddress}] Using native token metadata:`, metadata); // ++ LOGGING ++
      }

      // --- Merge Data ---
      const priceStr = prices[asset.tokenAddress] || '0'; // Handle null case
      const price = parseFloat(priceStr);
      const decimals = metadata.decimals ?? asset.decimals; // Use fetched decimals or fallback
      const amount = parseFloat(asset.balance) / 10 ** decimals;
      const value = price * amount; // Calculate value

      // ++ LOGGING: Log Asset Before Pushing ++
      const enrichedAsset: Asset = {
        ...asset,
        symbol: metadata.symbol ?? asset.symbol,
        name: metadata.name ?? asset.name,
        decimals: decimals,
        logoURI: metadata.logoURI,
        amount: amount,
        value: value,
      };
      console.log(
        `[Token ${asset.tokenAddress}] Asset PRE-FILTER:`,
        JSON.stringify(enrichedAsset, null, 2)
      );
      // ++ END LOGGING ++

      enrichedAssets.push(enrichedAsset);
    }
  }

  // ++ LOGGING: Log Count Before Filtering ++
  console.log(`Finished enriching. Total assets BEFORE filtering: ${enrichedAssets.length}`);
  // ++ END LOGGING ++

  // Add filtering for minimum value ($1)
  const finalAssets = enrichedAssets.filter(
    (asset) => asset.value !== undefined && asset.value >= 1
  );

  // ++ LOGGING: Log Count After Filtering ++
  console.log(`Filtered assets (value >= $1). Total assets AFTER filtering: ${finalAssets.length}`);
  // ++ END LOGGING ++

  return finalAssets;
};

export interface Quote {
  fromToken: {
    address: string;
    symbol: string;
    decimals: number;
  };
  toToken: {
    address: string;
    symbol: string;
    decimals: number;
  };
  fromTokenAmount: string;
  toTokenAmount: string;
  estimatedGas: string;
  protocols: any[];
  tx: {
    from: string;
    to: string;
    data: string;
    value: string;
    gas: string;
    gasPrice: string;
  };
}

export interface FusionQuoteParams {
  fromAssets: Array<{
    tokenAddress: string;
    amount: string;
  }>;
  toTokenAddress: string;
  toChainId: string | number;
  walletAddress: string;
  slippage?: number;
}

export interface FusionOrderParams {
  quote: Quote;
  walletClient: any;
  fromAddress: string;
}

export const getFusionQuote = async (params: FusionQuoteParams): Promise<Quote> => {
  const { fromAssets, toTokenAddress, toChainId, walletAddress, slippage = 1 } = params;

  try {
    const response = await fetch('/api/1inch/quote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fromAssets,
        toTokenAddress,
        toChainId,
        walletAddress,
        slippage,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch quote');
    }

    const quote = await response.json();
    return quote;
  } catch (error) {
    console.error('Error fetching quote:', error);
    throw error;
  }
};

export const submitFusionOrder = async (params: FusionOrderParams): Promise<{ txHash: string }> => {
  // TODO: Implement 1inch API call
  throw new Error('submitFusionOrder not implemented');
};
