# 1inch Sweep

Universal crypto asset management tool for cross-chain wallet scanning and token swaps with MEV protection.

## Features

- 🔍 **Multi-chain Scanner**
  - Real-time balances across chains
  - Native and ERC20 token support
  - Risk filtering and $1 min threshold

- 💱 **Universal Swaps**
  - Cross-chain bridging with MEV protection
  - Best rate routing and gas optimization
  - 1% fee (min $0.1)

- 🛡️ **Security**
  - Signature verification
  - Transaction simulation
  - Rate limiting
  - Slippage controls

## Supported Networks

- BNB Chain
- Polygon
- Arbitrum
- Optimism
- Base

## Stack

- Next.js 13.5 + TypeScript
- React Query
- Wagmi/Viem
- Radix UI + TailwindCSS
- APIs:
  - Asset Discovery: 1inch Balance API
  - Swaps: 1inch Fusion+ SDK

## Quick Start

```bash
# Install
git clone https://github.com/kryptogo/1inch-sweep.git
cd 1inch-sweep
pnpm install

# Configure
cp .env.example .env
# Fill in required env vars

# Development
pnpm dev

# Production
pnpm build
pnpm start
```

### Required Environment Variables

```bash
# Web3
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=
NEXT_PUBLIC_ALCHEMY_ID=

# 1inch API (Future)
NEXT_PUBLIC_1INCH_API_KEY=
NEXT_PUBLIC_1INCH_API_URL=
NEXT_PUBLIC_1INCH_FUSION_API_URL=
```

## Security

- API keys stored securely and rotated regularly
- Transaction signature verification and simulation
- Slippage validation and gas price checks
- Rate limiting with exponential backoff
- Comprehensive error handling

## Contributing

1. Fork repo
2. Create feature branch (`git checkout -b feature/xyz`)
3. Commit changes (`git commit -m 'Add xyz'`)
4. Push branch (`git push origin feature/xyz`)
5. Open PR

## Requirements

- Node.js ≥ v16
- pnpm