# Trading SDK

The CoW Protocol provides very flexible and powerful trading capabilities.
However, this flexibility comes with a cost: the complexity of the protocol.
This SDK serves to simplify the interaction with the CoW Protocol.
It will put all necessary parameters to your order, calculates proper amounts, and signs the order.

> You can find an example of the SDK usage in the [examples](../../examples/vanilla/src/index.ts).

### What constitutes the complexity?

 - [app-data](https://docs.cow.fi/cow-protocol/reference/sdks/app-data) (order's metadata)
 - [order signing](https://docs.cow.fi/cow-protocol/reference/sdks/cow-sdk/classes/OrderSigningUtils)
 - network costs, partner fee and slippage
 - order parameters (validTo, partiallyFillable, etc.)
 - quote API (priceQuality, signingScheme, etc.)
 - order kind (sell/buy)
 - order class (swap/limit/and others)

## TradingSdk

The SDK provides three main functions:
 - `postSwapOrder` - get quote with market price and create a swap order
 - `postLimitOrder` - create a limit order
 - `getQuote` - fetch a quote for a swap order

### Initialization

The SDK requires the following parameters:
 - `chainId` - one of supported chain ids (see [`SupportedChainId`](../common/chains.ts))
 - `signer` - private key or ethers signer. The signer is used to sign the order. If you use a private key, the SDK will create an ethers signer from it. If you use an ethers signer, the SDK will use it directly.
 - `appCode` - a unique identifier for your application. It is used to identify orders created by your application.

#### Example
```typescript
import { SupportedChainId, TradingSdk } from '@cowprotocol/sdk'

const sdk = new TradingSdk({
  chainId: SupportedChainId.SEPOLIA,
  signer: '<privateKeyOrEthersSigner>',
  appCode: '<YOUR_APP_CODE>',
})
```

### postSwapOrder

This function fetches a quote for a swap order and just creates the order.

The parameters required are:
 - `kind` - the order kind (sell/buy)
 - `sellToken` - the sell token address
 - `sellTokenDecimals` - the sell token decimals
 - `buyToken` - the buy token address
 - `buyTokenDecimals` - the buy token decimals
 - `amount` - the amount to sell/buy in atoms

#### Example

```typescript
import {
  SupportedChainId,
  OrderKind,
  TradeParameters,
  TradingSdk
} from '@cowprotocol/sdk'

const sdk = new TradingSdk({
  chainId: SupportedChainId.SEPOLIA,
  signer: '<privateKeyOrEthersSigner>',
  appCode: '<YOUR_APP_CODE>',
})

const parameters: TradeParameters = {
  kind: OrderKind.BUY,
  sellToken: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
  sellTokenDecimals: 18,
  buyToken: '0x0625afb445c3b6b7b929342a04a22599fd5dbb59',
  buyTokenDecimals: 18,
  amount: '120000000000000000'
}

const orderId = await sdk.postSwapOrder(parameters)

console.log('Order created, id: ', orderId)
```

### getQuote

In case if you want to get a quote and only then create an order, you can use the `getQuote` function.

The parameters required are the same as for the `postSwapOrder` function.

The function returns a quote object with the following fields:
 - `swapParameters` - the parameters used to get the quote
 - `amountsAndCosts` - the order sell/buy amounts including network costs, fees and slippage
 - `orderToSign` - the order to sign
 - `quoteResponse` - DTO from [quote API](https://api.cow.fi/docs/#/default/post_api_v1_quote)
 - `appDataInfo` - [order's metadata](https://docs.cow.fi/cow-protocol/reference/sdks/app-data)
 - `orderBookApi` - instance of [`OrderBookApi`](../order-book/api.ts)
 - `signer` - instance if Ethers signer

Another parameter is returned by this function is `postSwapOrderFromQuote`.
It can be used to create an order from the received quote.

#### Example

```typescript
import {
  SupportedChainId,
  OrderKind,
  TradeParameters,
  TradingSdk
} from '@cowprotocol/sdk'

const sdk = new TradingSdk({
  chainId: SupportedChainId.SEPOLIA,
  signer: '<privateKeyOrEthersSigner>',
  appCode: '<YOUR_APP_CODE>',
})

const parameters: TradeParameters = {
  kind: OrderKind.BUY,
  sellToken: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
  sellTokenDecimals: 18,
  buyToken: '0x0625afb445c3b6b7b929342a04a22599fd5dbb59',
  buyTokenDecimals: 18,
  amount: '120000000000000000'
}

const { quoteResults, postSwapOrderFromQuote } = await sdk.getQuote(parameters)

const buyAmount = quoteResults.amountsAndCosts.afterSlippage.buyAmount

if (confirm(`You will get at least: ${buyAmount}, ok?`)) {
  const orderId = await postSwapOrderFromQuote()

  console.log('Order created, id: ', orderId)
}
```

### postLimitOrder

This function is simpler than the `postSwapOrder` function, because it doesn't require a quote.

You need to provide the following parameters:
 - `kind` - the order kind (sell/buy)
 - `sellToken` - the sell token address
 - `sellTokenDecimals` - the sell token decimals
 - `buyToken` - the buy token address
 - `buyTokenDecimals` - the buy token decimals
 - `sellAmount` - the amount to sell in atoms
 - `buyAmount` - the amount to buy in atoms

```typescript
import {
  SupportedChainId,
  OrderKind,
  LimitTradeParameters,
  TradingSdk
} from '@cowprotocol/sdk'

const sdk = new TradingSdk({
  chainId: SupportedChainId.SEPOLIA,
  signer: '<privateKeyOrEthersSigner>',
  appCode: '<YOUR_APP_CODE>',
})

const limitOrderParameters: LimitTradeParameters = {
  kind: OrderKind.BUY,
  sellToken: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
  sellTokenDecimals: 18,
  buyToken: '0x0625afb445c3b6b7b929342a04a22599fd5dbb59',
  buyTokenDecimals: 18,
  sellAmount: '120000000000000000',
  buyAmount: '66600000000000000000',
}

const orderId = await sdk.postLimitOrder(limitOrderParameters)

console.log('Order created, id: ', orderId)
```

### Advanced swap order creation

By default, the SDK requires only the basic parameters to create an order.
However, you can provide additional parameters to customize the order creation.

#### Swap

1. `quoteRequest` - the quote request object. It is used to get a quote from the quote API ([read more](https://docs.cow.fi/cow-protocol/reference/sdks/cow-sdk/modules#orderquoterequest))
2. `appData` - the order's metadata ([read more](https://docs.cow.fi/cow-protocol/reference/sdks/app-data/modules#appdataparams))

##### Example

```typescript
import {
  SupportedChainId,
  OrderKind,
  TradeParameters,
  TradingSdk,
  SwapAdvancedSettings,
  PriceQuality
} from '@cowprotocol/sdk'

const sdk = new TradingSdk({
  chainId: SupportedChainId.SEPOLIA,
  signer: '<privateKeyOrEthersSigner>',
  appCode: '<YOUR_APP_CODE>',
})

const parameters: TradeParameters = {
  kind: OrderKind.BUY,
  sellToken: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
  sellTokenDecimals: 18,
  buyToken: '0x0625afb445c3b6b7b929342a04a22599fd5dbb59',
  buyTokenDecimals: 18,
  amount: '120000000000000000'
}

const advancedSettings: SwapAdvancedSettings = {
  quoteRequest: {
    priceQuality: PriceQuality.FAST,
    validFor: 120,
  },
  appData: {
    hooks: {
      version: 1,
      pre: [
        {
          target: '0xdef1ca1fb7fbcdc777520aa7f396b4e015f497ab',
          callData: '0x70a08231000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045',
          gasLimit: 21000
        }
      ]
    }
  },
}
const orderId = await sdk.postSwapOrder(parameters)

console.log('Order created, id: ', orderId)
```

#### Limit order

Same as for the swap order but without the `quoteRequest` parameter.