import { type NextRequest, NextResponse } from 'next/server';

const INCH_API_KEY = process.env.INCH_API_KEY || '';
// Assuming the general base URL is correct for the price endpoint
const INCH_API_GENERAL_BASE_URL = 'https://api.1inch.dev';

// Price endpoint URL - VERIFY THIS WITH 1INCH DOCS
const getPriceApiUrl = (chainId: string) => `${INCH_API_GENERAL_BASE_URL}/price/v1.1/${chainId}`;

export async function POST(request: NextRequest, { params }: { params: { chainId: string } }) {
  const { chainId } = params;

  if (!chainId) {
    return NextResponse.json({ message: 'Missing chainId' }, { status: 400 });
  }

  let tokens: string[] = [];
  try {
    const body = await request.json();
    if (!body.tokens || !Array.isArray(body.tokens)) {
      throw new Error('Missing or invalid "tokens" array in request body');
    }
    tokens = body.tokens;
  } catch (e) {
    return NextResponse.json(
      { message: 'Invalid request body. Expecting { "tokens": [...] }' },
      { status: 400 }
    );
  }

  if (tokens.length === 0) {
    return NextResponse.json({}, { status: 200 }); // Return empty object if no tokens requested
  }

  if (!INCH_API_KEY) {
    console.error('[Price Proxy] Server Error: INCH_API_KEY is not set.');
    return NextResponse.json({ message: 'Internal server configuration error' }, { status: 500 });
  }

  const inchPriceApiUrl = getPriceApiUrl(chainId);
  const headers = {
    Authorization: `Bearer ${INCH_API_KEY}`,
    accept: 'application/json',
    'Content-Type': 'application/json',
  };

  console.log(
    `[Price Proxy] Proxying price request for ${tokens.length} tokens on chain ${chainId}...`
  );

  try {
    const response = await fetch(inchPriceApiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ tokens: tokens, currency: 'USD' }), // Assuming this body format - VERIFY
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[Price Proxy] 1inch API error on chain ${chainId}: ${response.status} ${errorText}`
      );
      return NextResponse.json(
        { message: `1inch Price API Error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`[Price Proxy] Successfully fetched prices on chain ${chainId}`);
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error(`[Price Proxy] Error proxying 1inch price request on chain ${chainId}:`, error);
    return NextResponse.json(
      { message: 'Internal server error during price API proxy' },
      { status: 500 }
    );
  }
}
