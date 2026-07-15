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

## Signer-less example

`src/signerless.ts` runs the same trade without ever passing a signer or private key to the SDK:
the order is signed by a local viem account standing in for a cold wallet or custody service.
Unlike the ethers example, viem signs the quote's `orderTypedData` as-is (no `EIP712Domain` to strip).
Set `PRIVATE_KEY` in `src/signerless.ts`, then:

```
pnpm --filter example-nodejs-viem dev:signerless
```
