# Node.js example - viem

This script demonstrates a full token swap flow on the CoW Protocol using the Viem on the Sepolia testnet:

- Setup — Creates a Viem public client connected to Sepolia and derives a wallet account from a private key.
- Adapter wiring — Wraps the Viem client/signer in a ViemAdapter and registers it globally so the CoW SDK knows how to sign and send transactions.
- Allowance check — Queries how much WETH the CoW Protocol vault relayer is already approved to spend on behalf of the owner. If it's less than the sell amount, it sends an approval transaction and waits for it to be mined.
- Quote — Asks the CoW Protocol off-chain API for a quote to sell 0.01 WETH for USDC, with 50 bps (0.5%) slippage tolerance.
- Order posting — Submits the swap order to CoW Protocol's orderbook. CoW's solvers then compete to fill it at the best price, potentially via batch auctions that capture MEV and surplus for the user.

## Setup

1. Edit `src/index.ts` and set:

- `PRIVATE_KEY`: your private key (starts with `0x`)
- Optionally adjust `DEFAULT_SELL_AMOUNT`, `RPC_URL`

2. Install deps (at repo root):

```
pnpm install
```

## Run

Dev (TS directly):

```
pnpm --filter example-nodejs-viem dev
```

Build + run:

```
pnpm --filter example-nodejs-viem build
pnpm --filter example-nodejs-viem start
```
