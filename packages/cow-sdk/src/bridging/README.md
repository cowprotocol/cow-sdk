# Bridging SDK

SDK for swapping between chains.

## Usage

```ts
import { SupportedChainId, BridgingSdk, QuoteBridgeRequest, OrderKind, assertIsBridgeQuoteAndPost } from '@cowprotocol/cow-sdk'

const sdk = new BridgingSdk()

const parameters: QuoteBridgeRequest = {
  // Cross-chain orders, are always SELL orders (BUY not supported yet)
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
  amount: '120000000000000000'

  signer: '<privateKeyOrEthersSigner>',

  // Optional parameters
  appCode: '<YOUR_APP_CODE>',
}

// Get a quote (and the post callback) for a cross-chain swap
const quoteResult = await sdk.getQuote(parameters)
assertIsBridgeQuoteAndPost(quoteResult) // Assert that the quote result is of type BridgeQuoteAndPost (type for cross-chain quotes, as opposed to QuoteAndPost for single-chain quotes). The assertion makes typescript happy.
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
