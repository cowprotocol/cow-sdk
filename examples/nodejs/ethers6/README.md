# Node.js example - ethers v6

Run a headless CoW Protocol trade using ethers v6.

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
pnpm --filter example-nodejs-ethers6 dev
```

Build + run:

```
pnpm --filter example-nodejs-ethers6 build
pnpm --filter example-nodejs-ethers6 start
```
