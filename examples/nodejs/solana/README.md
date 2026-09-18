# Node.js example - Solana

Run an end-to-end CoW Protocol Solana trade: get a quote, approve the settlement
program as SPL delegate, build the `CreateOrder` instruction, and submit both in one transaction.

See [`@cowprotocol/sdk-trading-solana`'s README](../../../packages/sdk-trading-solana/README.md) for
what each step does and why.

**This example targets mainnet by default and trades real funds.** Point `RPC_URL` at a devnet
cluster and use devnet mints instead if you just want to try the flow risk-free.

## Setup

1. Get your wallet's private key, base58-encoded (e.g. Phantom/Solflare's "Export Private Key").

2. Make sure that wallet holds:

   - enough SOL for transaction fees and account rent, and
   - a balance of whatever `SELL_MINT` is set to (WSOL by default — wrap native SOL into it first if
     you don't already hold any).

3. Edit `src/index.ts` and set:

   - `SELL_MINT` / `SELL_MINT_DECIMALS`: the mint you're selling and its decimals
   - Optionally adjust `DEFAULT_SELL_AMOUNT`, `BUY_MINT`, `RPC_URL`

4. Install deps (at repo root):

   ```
   pnpm install
   ```

## Run

Dev (TS directly):

```
PRIVATE_KEY=<base58-secret-key> pnpm --filter example-nodejs-solana dev
```

Build + run:

```
pnpm --filter example-nodejs-solana build
PRIVATE_KEY=<base58-secret-key> pnpm --filter example-nodejs-solana start
```
