<p align="center">
  <img width="400" src="https://github.com/cowprotocol/cow-sdk/raw/main/docs/images/CoW.png" alt="CoW Protocol logo" />
</p>

# Solana Trading SDK

## Test coverage

| Statements                                                                              | Branches                                                                            | Functions                                                                             | Lines                                                                         |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| ![Statements](https://img.shields.io/badge/statements-87.64%25-yellow.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-95.91%25-brightgreen.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-55.17%25-red.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-95%25-brightgreen.svg?style=flat) |

CoW Protocol's Solana settlement support: Jupiter-sourced quotes and on-chain `CreateOrder`
posting against the CoW Protocol Solana settlement program.

**Experimental.** The Solana settlement program this package targets isn't deployed anywhere
reachable yet. See `docs/superpowers/specs/2026-09-01-sdk-trading-solana-extraction-design.md` in
the `cowswap` repo for background.

## Usage

```ts
import { SolanaTradingSdk } from '@cowprotocol/sdk-trading-solana'

const sdk = new SolanaTradingSdk({ signAndSend })
const { quoteResults, postSwapOrderFromQuote } = await sdk.getQuote({
  ownerAddress,
  receiverAddress,
  sellTokenAddress,
  sellTokenDecimals,
  buyTokenAddress,
  buyTokenDecimals,
  amount,
  kind,
})

const result = await postSwapOrderFromQuote()
```
