# Trading SDK

## Swap

```typescript
import {
  getQuote,
  getOrderToSignFromQuoteResult,
  postCoWProtocolTrade,
  swapParamsToLimitOrderParams,
  SupportedChainId,
  OrderKind,
  SwapParameters
} from '@cowprotocol/sdk'

const swapParameters: SwapParameters = {
  chainId: SupportedChainId.SEPOLIA,
  signer: '<privateKeyOrEthersSigner>',
  appCode: 'my-trade-sdk-app',

  kind: OrderKind.SELL,
  sellToken: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
  sellTokenDecimals: 18,
  buyToken: '0x0625afb445c3b6b7b929342a04a22599fd5dbb59',
  buyTokenDecimals: 18,
  amount: '120000000000000000',
  slippageBps: '500', // 5%
}

const getQuoteResult = await getQuote(swapParameters)

console.log('You will get at least: ', getQuoteResult.amountsAndCosts.afterSlippage.buyAmount)

const orderToSign = await getOrderToSignFromQuoteResult(getQuoteResult, swapParameters)

console.log('Order to sign: ', orderToSign)

const { orderBookApi, signer, appDataInfo, quoteResponse } = getQuoteResult

const orderId = await postCoWProtocolTrade(
  orderBookApi,
  signer,
  appDataInfo,
  swapParamsToLimitOrderParams(swapParameters, quoteResponse)
)

console.log('Order created, id: ', orderId)
```

## Limit order

```typescript
import {
  getQuote,
  getOrderToSignFromQuoteResult,
  postCoWProtocolTrade,
  swapParamsToLimitOrderParams,
  SupportedChainId,
  OrderKind,
  LimitOrderParameters
} from '@cowprotocol/sdk'

const limitOrderParameters: LimitOrderParameters = {
  chainId: SupportedChainId.SEPOLIA,
  signer: '<privateKeyOrEthersSigner>',
  appCode: 'my-trade-sdk-app',

  kind: OrderKind.BUY,
  sellToken: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
  sellTokenDecimals: 18,
  buyToken: '0x0625afb445c3b6b7b929342a04a22599fd5dbb59',
  buyTokenDecimals: 18,
  sellAmount: '120000000000000000',
  buyAmount: '66600000000000000000',
  networkCostsAmount: '0'
}

const orderId = await postLimitOrder(limitOrderParameters)

console.log('Order created, id: ', orderId)
```
