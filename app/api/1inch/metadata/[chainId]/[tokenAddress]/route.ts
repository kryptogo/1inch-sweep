import { type NextRequest, NextResponse } from 'next/server';

const INCH_API_KEY = process.env.INCH_API_KEY || '';
// Assuming the general base URL is correct for the token endpoint
const INCH_API_GENERAL_BASE_URL = 'https://api.1inch.dev';

// Metadata endpoint URL - VERIFY THIS WITH 1INCH DOCS
// Old: const getMetadataApiUrl = (chainId: string, tokenAddress: string) =>
//   `${INCH_API_GENERAL_BASE_URL}/token/v1.2/${chainId}/details?address=${tokenAddress}`;

// New: Attempt using Portfolio API structure (v3) - check 1inch docs if this specific path is correct
const getMetadataApiUrl = (chainId: string, tokenAddress: string) =>
  `${INCH_API_GENERAL_BASE_URL}/portfolio/v3/tokens/by-address/${chainId}/${tokenAddress.toLowerCase()}`;

export async function GET(
  request: NextRequest,
  { params }: { params: { chainId: string; tokenAddress: string } }
) {
  const { chainId, tokenAddress } = params;

  if (!chainId || !tokenAddress) {
    return NextResponse.json({ message: 'Missing chainId or tokenAddress' }, { status: 400 });
  }

  if (!INCH_API_KEY) {
    console.error('[Metadata Proxy] Server Error: INCH_API_KEY is not set.');
    return NextResponse.json({ message: 'Internal server configuration error' }, { status: 500 });
  }

  const inchMetadataApiUrl = getMetadataApiUrl(chainId, tokenAddress);
  const headers = {
    Authorization: `Bearer ${INCH_API_KEY}`,
    accept: 'application/json',
  };

  console.log(
    `[Metadata Proxy] Proxying metadata request for ${tokenAddress} on chain ${chainId}...`
  );

  try {
    const response = await fetch(inchMetadataApiUrl, { headers });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[Metadata Proxy] 1inch API error for ${tokenAddress} on chain ${chainId}: ${response.status} ${errorText}`
      );
      return NextResponse.json(
        { message: `1inch Metadata API Error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(
      `[Metadata Proxy] Successfully fetched metadata for ${tokenAddress} on chain ${chainId}`
    );
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error(
      `[Metadata Proxy] Error proxying 1inch metadata request for ${tokenAddress} on chain ${chainId}:`,
      error
    );
    return NextResponse.json(
      { message: 'Internal server error during metadata API proxy' },
      { status: 500 }
    );
  }
}
