import { type NextRequest, NextResponse } from 'next/server';

const INCH_API_KEY = process.env.INCH_API_KEY || '';
const INCH_BALANCE_API_BASE_URL =
  process.env.NEXT_PUBLIC_1INCH_API_URL || 'https://api.1inch.dev/balance/v1.2';

// Define the GET handler for the App Router
export async function GET(
  request: NextRequest,
  { params }: { params: { chainId: string; walletAddress: string } }
) {
  const { chainId, walletAddress } = params;

  // Basic validation (already handled by route structure, but good practice)
  if (!chainId || !walletAddress) {
    return NextResponse.json({ message: 'Missing chainId or walletAddress' }, { status: 400 });
  }

  if (!INCH_API_KEY) {
    console.error('Server Error: INCH_API_KEY is not set.');
    return NextResponse.json({ message: 'Internal server configuration error' }, { status: 500 });
  }

  const inchApiUrl = `${INCH_BALANCE_API_BASE_URL}/${chainId}/balances/${walletAddress}`;
  const headers = {
    Authorization: `Bearer ${INCH_API_KEY}`,
    accept: 'application/json',
  };

  console.log(`[App Router] Proxying balance request for ${walletAddress} on chain ${chainId}...`);

  try {
    // Use fetch API directly
    const response = await fetch(inchApiUrl, { headers });

    // Check if the response was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[App Router] 1inch API error for ${walletAddress} on chain ${chainId}: ${response.status} ${errorText}`
      );
      // Return a JSON response with the error status from 1inch
      return NextResponse.json(
        { message: `1inch API Error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    // If successful, parse the JSON and forward it
    const data = await response.json();
    console.log(
      `[App Router] Successfully fetched balances for ${walletAddress} on chain ${chainId}`
    );
    // Return the data with a 200 OK status
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error(
      `[App Router] Error proxying 1inch balance request for ${walletAddress} on chain ${chainId}:`,
      error
    );
    return NextResponse.json(
      { message: 'Internal server error during API proxy' },
      { status: 500 }
    );
  }
}

// You can add handlers for other HTTP methods (POST, PUT, DELETE) here if needed
