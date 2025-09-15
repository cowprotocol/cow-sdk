<p align="center">
  <img width="400" src="https://github.com/cowprotocol/cow-sdk/raw/main/docs/images/CoW.png" />
</p>

# SDK Bridging

This package provides bridging functionality for the CoW Protocol SDK, enabling cross-chain token transfers and interactions. It integrates with various bridge providers to facilitate seamless asset movement across supported blockchain networks.

## Installation

```bash
npm install @cowprotocol/sdk-bridging
or
pnpm add @cowprotocol/sdk-bridging
or
yarn add @cowprotocol/sdk-bridging
```

## Usage

### Individual package usage

```typescript
import {
  SupportedChainId,
  BridgingSdk,
  QuoteBridgeRequest,
  OrderKind,
  assertIsBridgeQuoteAndPost,
} from '@cowprotocol/sdk-bridging'
import { EthersV6Adapter } from '@cowprotocol/sdk-ethers-v6-adapter'
import { JsonRpcProvider, Wallet } from 'ethers'

// Configure the adapter
const provider = new JsonRpcProvider('YOUR_RPC_URL')
const wallet = new Wallet('YOUR_PRIVATE_KEY', provider)
const adapter = new EthersV6Adapter({ provider, signer: wallet })

// Initialize bridging SDK
const bridging = new BridgingSdk(adapter, options)

const parameters: QuoteBridgeRequest = {
  // Cross-chain orders are always SELL orders (BUY not supported yet)
  kind: OrderKind.SELL,

  // Sell token (and source chain)
  sellTokenChainId: SupportedChainId.ARBITRUM_ONE,
  sellTokenAddress: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
  sellTokenDecimals: 18,

  // Buy token (and target chain)
  buyTokenChainId: SupportedChainId.BASE,
  buyTokenAddress: '0x0625afb445c3b6b7b929342a04a22599fd5dbb59',
  buyTokenDecimals: 18,

  // Amount to sell
  amount: '120000000000000000',

  signer: adapter.signer,

  // Optional parameters
  appCode: 'YOUR_APP_CODE',
}

// Get a quote (and the post callback) for a cross-chain swap
const quoteResult = await sdk.getQuote(parameters)
// Assert that the quote result is of type BridgeQuoteAndPost
// (type for cross-chain quotes, as opposed to QuoteAndPost for single-chain quotes).
// The assertion makes typescript happy.
assertIsBridgeQuoteAndPost(quoteResult)
const { swap, bridge, postSwapOrderFromQuote } = quoteResult

// Display all data related to the swap (costs, amounts, appData including the bridging hook, etc.) 🐮
console.log('Swap info', swap)

// Display all data related to the bridge (costs, amounts, provider info, hook, and the bridging quote) ✉️
console.log('Bridge info', bridge)

// Get the buy amount after slippage in the target chain
const { buyAmount } = bridge.amountsAndCosts.afterSlippage

if (confirm(`You will get at least: ${buyAmount}, ok?`)) {
  const orderId = await postSwapOrderFromQuote()
  console.log('Order created, id: ', orderId)
}
```

### Usage with CoW SDK

```typescript
import {
  CowSdk,
  SupportedChainId,
  QuoteBridgeRequest,
  OrderKind,
  assertIsBridgeQuoteAndPost,
} from '@cowprotocol/cow-sdk'
import { EthersV6Adapter } from '@cowprotocol/sdk-ethers-v6-adapter'
import { JsonRpcProvider, Wallet } from 'ethers'

// Configure the adapter
const provider = new JsonRpcProvider('YOUR_RPC_URL')
const wallet = new Wallet('YOUR_PRIVATE_KEY', provider)
const adapter = new EthersV6Adapter({ provider, signer: wallet })

// Initialize the unified SDK
const sdk = new CowSdk({
  chainId: SupportedChainId.ARBITRUM_ONE, // Source chain
  adapter,
})

const parameters: QuoteBridgeRequest = {
  // Cross-chain orders are always SELL orders (BUY not supported yet)
  kind: OrderKind.SELL,

  // Sell token (and source chain)
  sellTokenChainId: SupportedChainId.ARBITRUM_ONE,
  sellTokenAddress: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
  sellTokenDecimals: 18,

  // Buy token (and target chain)
  buyTokenChainId: SupportedChainId.BASE,
  buyTokenAddress: '0x0625afb445c3b6b7b929342a04a22599fd5dbb59',
  buyTokenDecimals: 18,

  // Amount to sell
  amount: '120000000000000000',

  signer: adapter.signer,

  // Optional parameters
  appCode: 'YOUR_APP_CODE',
}

const quoteResult = await sdk.bridging.getQuote(parameters)
assertIsBridgeQuoteAndPost(quoteResult)
const { swap, bridge, postSwapOrderFromQuote } = quoteResult

// Display all data related to the swap and bridge
console.log('Swap info', swap)
console.log('Bridge info', bridge)

// Get the buy amount after slippage in the target chain
const { buyAmount } = bridge.amountsAndCosts.afterSlippage

if (confirm(`You will get at least: ${buyAmount}, ok?`)) {
  const orderId = await postSwapOrderFromQuote()
  console.log('Order created, id: ', orderId)
}
```

## Supported Bridge Providers

- Additional bridge providers are being integrated
- More details will be available as development progresses
