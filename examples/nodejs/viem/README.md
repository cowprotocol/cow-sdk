# Node.js example - viem

Run a headless CoW Protocol trade using viem.

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
