<p align="center">
  <img width="400" src="https://github.com/cowprotocol/cow-sdk/raw/main/docs/images/CoW.png" />
</p>

# Solana Trading SDK

## Test coverage

| Statements | Branches | Functions | Lines |
| --- | --- | --- | --- |
| ![Statements](https://img.shields.io/badge/statements-pending-lightgrey.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-pending-lightgrey.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-pending-lightgrey.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-pending-lightgrey.svg?style=flat) |

CoW Protocol's Solana settlement support: Jupiter-sourced quotes and on-chain `CreateOrder`
posting against the CoW Protocol Solana settlement program.

**Not published to npm.** This package is `private` and consumed via a local `link:` dependency
during development — the Solana settlement program it targets isn't deployed anywhere reachable
yet. See `docs/superpowers/specs/2026-09-01-sdk-trading-solana-extraction-design.md` in the
`cowswap` repo for background.

## Usage

```ts
import { SolanaTradingSdk } from '@cowprotocol/sdk-trading-solana'

const sdk = new SolanaTradingSdk({ signAndSend })
const { quote, postSwapOrderFromQuote } = await sdk.getQuote({
  owner,
  sellMint,
  buyMint,
  amount,
  kind,
})

const result = await postSwapOrderFromQuote()
```
