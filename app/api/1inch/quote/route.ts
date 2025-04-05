import { NextRequest, NextResponse } from 'next/server';
import { INCH_API_KEY } from '../../../../lib/config';

export async function POST(request: NextRequest) {
  try {
    const { fromAssets, toTokenAddress, toChainId, walletAddress, slippage } = await request.json();

    // 確保所有必需的參數都存在
    if (!fromAssets || !toTokenAddress || !toChainId || !walletAddress) {
      return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 });
    }

    // 目前只支持單個資產轉換
    if (fromAssets.length !== 1) {
      return NextResponse.json(
        { message: 'Currently only supports single asset conversion' },
        { status: 400 }
      );
    }

    const fromAsset = fromAssets[0];
    console.log('Sending request to 1inch API with params:', {
      fromTokenAddress: fromAsset.tokenAddress,
      toTokenAddress,
      amount: fromAsset.amount,
      walletAddress,
      chainId: toChainId,
    });

    const url = `https://api.1inch.dev/swap/v5.2/${toChainId}/quote`;
    const params = new URLSearchParams({
      fromTokenAddress: fromAsset.tokenAddress,
      toTokenAddress,
      amount: fromAsset.amount.toString(),
      walletAddress,
      slippage: (slippage || 1).toString(),
    });

    const response = await fetch(`${url}?${params}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${INCH_API_KEY}`,
      },
    });

    const responseText = await response.text();
    console.log('1inch API response:', responseText);

    if (!response.ok) {
      try {
        const error = JSON.parse(responseText);
        console.error('1inch API error:', error);
        return NextResponse.json(
          { message: error.message || 'Failed to fetch quote' },
          { status: response.status }
        );
      } catch (e) {
        console.error('Failed to parse error response:', e);
        return NextResponse.json(
          { message: 'Failed to fetch quote: Invalid response from API' },
          { status: response.status }
        );
      }
    }

    try {
      const quote = JSON.parse(responseText);
      return NextResponse.json(quote);
    } catch (e) {
      console.error('Failed to parse quote response:', e);
      return NextResponse.json({ message: 'Failed to parse quote response' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error in quote route:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
