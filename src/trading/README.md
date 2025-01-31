# Trading SDK

CoW Protocol is intent based, decentralized trading protocol that allows users to trade ERC-20 tokens.
This SDK makes it easier to interact with CoW Protocol by handling order parameters, calculating amounts, and signing orders.

### Basic Trading Flow
1. 🔎 Get a quote (price) for a trade
2. ✍️ Sign the order
3. ✅ Post the order to the order-book

The CoW Protocol provides very flexible and powerful trading capabilities.
However, this flexibility comes with a cost: the complexity of the protocol.
This SDK serves to simplify the interaction with the CoW Protocol.
It will put all necessary parameters to your order, calculates proper amounts, and signs the order.

### Why Use This SDK?

 - [App-data](https://docs.cow.fi/cow-protocol/reference/sdks/app-data) (order metadata)
 - [Order signing](https://docs.cow.fi/cow-protocol/reference/sdks/cow-sdk/classes/OrderSigningUtils)
 - Network costs, fees, and slippage
 - Order parameters (validity, partial fills, etc.)
 - Quote API settings (price quality, signing scheme, etc.)
 - Order types (market, limit, on-chain trades, etc.)

> See the [examples](../../examples/vanilla/src/index.ts) for usage.

## TradingSdk Functions

Main functions:
- `postSwapOrder` - Get a quote and create a swap order.
- `postLimitOrder` - Create a limit order.
- `getQuote` - Fetch a quote for a swap order.

Special cases:
- `postSellNativeCurrencyOrder` - Sell blockchain native tokens (e.g., ETH on Ethereum).
- `getPreSignTransaction` - Sign an order using a smart contract wallet.

### Setup

You need:
- `chainId` - Supported chain ID ([see list](../common/chains.ts)).
- `signer` - Private key, ethers signer, or `Eip1193` provider.
- `appCode` - Unique app identifier for tracking orders.

#### Example
```typescript
import { SupportedChainId, TradingSdk } from '@cowprotocol/cow-sdk'

const sdk = new TradingSdk({
  chainId: SupportedChainId.SEPOLIA,
  signer: '<privateKeyOrEthersSigner>',
  appCode: '<YOUR_APP_CODE>',
})
```

### Options

For detailed information about trading steps you can enable the SDK logging:

```typescript
import { SupportedChainId, TradingSdk, TradingSdkOptions } from '@cowprotocol/cow-sdk'

const traderParams = {
  chainId: SupportedChainId.SEPOLIA,
  signer: '<privateKeyOrEthersSigner>',
  appCode: '<YOUR_APP_CODE>',
}

const sdkOptions: TradingSdkOptions = {
  enableLogging: true // <--
}

const sdk = new TradingSdk(traderParams, sdkOptions)
```

### getQuote

In case if you want to get a quote and only then create an order, you can use the `getQuote` function.

The parameters required are the same as for the `postSwapOrder` function.

The function returns `quoteResults` object with the following properties:
 - `tradeParameters` - trade type, assets, amounts and other optional parameters
 - `amountsAndCosts` - the order sell/buy amounts including network costs, fees and slippage
 - `orderToSign` - order parameters to sign (see [order signing](https://docs.cow.fi/cow-protocol/reference/sdks/cow-sdk/classes/OrderSigningUtils))
 - `quoteResponse` - DTO from [quote API](https://api.cow.fi/docs/#/default/post_api_v1_quote)
 - `appDataInfo` - [order's metadata](https://docs.cow.fi/cow-protocol/reference/sdks/app-data)
 - `orderTypedData` - EIP-712 typed data for signing

Another parameter is returned by this function is `postSwapOrderFromQuote`.
It can be used to create an order from the received quote.

#### Example

```typescript
import {
  SupportedChainId,
  OrderKind,
  TradeParameters,
  TradingSdk
} from '@cowprotocol/cow-sdk'

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

### postSwapOrder

This function fetches a quote for a swap order and just creates the order.

The parameters required are:
- `kind` - the order kind (sell/buy)
- `sellToken` - the sell token address
- `sellTokenDecimals` - the sell token decimals
- `buyToken` - the buy token address
- `buyTokenDecimals` - the buy token decimals
- `amount` - the amount to sell/buy in atoms

> When sell token is a blockchain native token (ETH for Ethereum), then order will be created as an on-chain transaction. See [postSellNativeCurrencyOrder](#postSellNativeCurrencyOrder)

#### Example

```typescript
import {
  SupportedChainId,
  OrderKind,
  TradeParameters,
  TradingSdk
} from '@cowprotocol/cow-sdk'

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

### postLimitOrder

This main difference between this function and `postSwapOrder` is that here you need to specify both sell and buy amounts.

You need to provide the following parameters:
 - `kind` - the order kind (sell/buy)
 - `sellToken` - the sell token address
 - `sellTokenDecimals` - the sell token decimals
 - `buyToken` - the buy token address
 - `buyTokenDecimals` - the buy token decimals
 - `sellAmount` - the amount to sell in atoms
 - `buyAmount` - the amount to buy in atoms

And optional parameters:
 - `quoteId` - id of the quote from the quote API (see getQuote function)
 - `validTo` - the order expiration time in seconds

```typescript
import {
  SupportedChainId,
  OrderKind,
  LimitTradeParameters,
  TradingSdk
} from '@cowprotocol/cow-sdk'

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

### postSellNativeCurrencyOrder

CoW Protocol supports on-chain trades for selling blockchain native tokens (ETH for Ethereum).
In this case, the order is created as an on-chain transaction.
You don't have to think about the case when you use `postSwapOrder` function, it will be handled automatically.
But if you need more flexible way to create an order to sell native token, you can use the `postSellNativeCurrencyOrder` function.

> We consider the order as native token selling order if the sell token has '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' address.

```typescript
import {
  SupportedChainId,
  OrderKind,
  TradeParameters,
  TradingSdk
} from '@cowprotocol/cow-sdk'

const sdk = new TradingSdk({
  chainId: SupportedChainId.SEPOLIA,
  signer: '<privateKeyOrEthersSigner>',
  appCode: '<YOUR_APP_CODE>',
})

const parameters: TradeParameters = {
  kind: OrderKind.BUY,
  sellToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  sellTokenDecimals: 18,
  buyToken: '0x0625afb445c3b6b7b929342a04a22599fd5dbb59',
  buyTokenDecimals: 18,
  amount: '120000000000000000'
}

const orderId = await sdk.postSellNativeCurrencyOrder(parameters)

console.log('Order created, id: ', orderId)
```


### Get quote for a smart-contract wallet

If you want to use a smart-contract wallet to sign the order, you should specify the `signingScheme` parameter in order to get more accurate quote in terms of gas efficiency.
Smart-contract wallets are supported by using a different signing scheme - `SigningScheme.PRESIGN`.

#### Example

```typescript
import {
  SupportedChainId,
  OrderKind,
  TradeParameters,
  SwapAdvancedSettings,
  SigningScheme,
  TradingSdk
} from '@cowprotocol/cow-sdk'

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

const advancedParameters: SwapAdvancedSettings = {
  quoteRequest: {
    // Specify the signing scheme
    signingScheme: SigningScheme.PRESIGN
  }
}

const { quoteResults } = await sdk.getQuote(parameters)

console.log('Quote:', quoteResults)
````

### Create an order with smart-contract wallet

If you want to create an order with a smart-contract wallet, you should specify the `signingScheme` parameter in the `postSwapOrder` function.
And then you need to send a transaction from `getPreSignTransaction` result in order to sign the order.

#### Example

```typescript
import {
  SupportedChainId,
  OrderKind,
  TradeParameters,
  TradingSdk
} from '@cowprotocol/cow-sdk'

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

const advancedParameters: SwapAdvancedSettings = {
  quoteRequest: {
    // Specify the signing scheme
    signingScheme: SigningScheme.PRESIGN
  }
}

const smartContractWalletAddress = '0x<smartContractWalletAddress>'
const orderId = await sdk.postSwapOrder(parameters, advancedParameters)
const preSignTransaction = await sdk.getPreSignTransaction({ orderId, account: smartContractWalletAddress })

console.log('Order created with "pre-sign" state, id: ', orderId)
console.log('Execute the transaction to sign the order', preSignTransaction)
```

### Optional parameters

Both `postSwapOrder` and `postLimitOrder` functions have optional parameters.
See `TradeOptionalParameters` type for more details.

| **Parameter**        | **Type**        | **Default Value** | **Description**                                                                                                                                                 |
|-----------------------|-----------------|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `env`                | `Env`          | `prod`            | The environment to use (`prod` or `staging`).                                                                                                                   |
| `partiallyFillable`  | `boolean`      | `false`           | Indicates whether the order is fill-or-kill or partially fillable.                                                                                              |
| `slippageBps`        | `number`       | 50                | Slippage tolerance applied to the order to get the limit price. Expressed in Basis Points (BPS). One basis point is equivalent to 0.01% (1/100th of a percent). |
| `receiver`           | `string`       | order creator     | The address that will receive the order's tokens.                                                                                                               |
| `validFor`           | `number`       | 10 mins           | The order expiration time in seconds.                                                                                                                           |
| `partnerFee`         | `PartnerFee`   | -                 | Partners of the protocol can specify their fee for the order, including the fee in basis points (BPS) and the fee recipient address. [Read more](https://docs.cow.fi/governance/fees/partner-fee)                  |

##### Example

```typescript
import { SupportedChainId, OrderKind, TradeParameters, TradingSdk } from '@cowprotocol/cow-sdk'

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
  amount: '120000000000000000',
  // Optional parameters
  slippageBps: 200, // 2%
  validFor: 1200, // 20 mins
  receiver: '0xdef1ca1fb7f1232777520aa7f396b4e015f497ab' // Just a random address, don't use it!
}

const orderId = await sdk.postSwapOrder(parameters)

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
} from '@cowprotocol/cow-sdk'

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
const orderId = await sdk.postSwapOrder(parameters, advancedSettings)

console.log('Order created, id: ', orderId)
```

#### Limit order

Same as for the swap order but without the `quoteRequest` parameter.
