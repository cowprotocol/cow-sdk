# Bridging SDK

SDK for swapping between chains.

This documentation is a WIP as this feature remains in development, as the SDK is subject to change.

## Usage

```ts
import { SupportedChainId, BridgingSdk, QuoteBridgeRequest, OrderKind } from '@cowprotocol/cow-sdk'

const sdk = new BridgingSdk({
  chainId: SupportedChainId.SEPOLIA,
  signer: '<privateKeyOrEthersSigner>',
  appCode: '<YOUR_APP_CODE>',
})

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
}

const { quoteResults, postSwapOrderFromQuote } = await sdk.getQuote(parameters)

const buyAmount = quoteResults.amountsAndCosts.afterSlippage.buyAmount

if (confirm(`You will get at least: ${buyAmount}, ok?`)) {
  const orderId = await postSwapOrderFromQuote()

  console.log('Order created, id: ', orderId)
}
```
