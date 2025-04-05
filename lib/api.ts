// API utility functions for universal swap

/**
 * Get token balances for the user's wallet
 * @param userAddress The user's wallet address
 * @param chainId The chain ID to get balances for
 * @returns The token balances for the specified chain
 */
export async function getTokenBalances(userAddress: string, chainId: string) {
  try {
    const response = await fetch(`/api/1inch/balances/${chainId}/${userAddress}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching token balances:', error);
    throw error;
  }
}

/**
 * Get token metadata
 * @param chainId The chain ID
 * @param tokenAddress The token address
 * @returns The token metadata
 */
export async function getTokenMetadata(chainId: string, tokenAddress: string) {
  try {
    const response = await fetch(`/api/1inch/metadata/${chainId}/${tokenAddress}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching token metadata:', error);
    throw error;
  }
}

/**
 * Get token prices
 * @param chainId The chain ID
 * @param tokens Array of token addresses
 * @returns The token prices
 */
export async function getTokenPrices(chainId: string, tokens: string[]) {
  try {
    const response = await fetch(`/api/1inch/prices/${chainId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tokens }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching token prices:', error);
    throw error;
  }
}
