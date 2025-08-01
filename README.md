<p align="center">
  <img width="400" src="https://github.com/cowprotocol/cow-sdk/raw/main/docs/images/CoW.png" />
</p>

# CoW SDK

## 📚 [Docs website](https://docs.cow.fi/)

## Test coverage

| Statements                                                                                 | Branches                                                                       | Functions                                                                                | Lines                                                                            |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| ![Statements](https://img.shields.io/badge/statements-94.77%25-brightgreen.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-76.78%25-red.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-97.43%25-brightgreen.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-97.67%25-brightgreen.svg?style=flat) |

## Getting started

**Usage examples:** [VanillaJS](https://github.com/cowprotocol/cow-sdk/blob/main/examples/vanilla/src/index.ts),
[Create React App](https://github.com/cowprotocol/cow-sdk/blob/main/examples/cra/src/pages/getOrders/index.tsx),
[NodeJS](https://github.com/cowprotocol/cow-sdk/blob/main/examples/nodejs/src/index.ts)

### Installation

```bash
pnpm add @cowprotocol/cow-sdk
```

## Umbrella SDK

The CoW SDK offers a unified interface through `CowSdk` that provides access to all modules in a single instance:

```typescript
import { CowSdk, SupportedChainId, OrderKind } from '@cowprotocol/cow-sdk'
import { EthersV6Adapter } from '@cowprotocol/sdk-ethers-v6-adapter'
import { JsonRpcProvider, Wallet } from 'ethers'

// Configure the adapter
const provider = new JsonRpcProvider('YOUR_RPC_URL')
const wallet = new Wallet('YOUR_PRIVATE_KEY', provider)
const adapter = new EthersV6Adapter({ provider, signer: wallet })

// Initialize the unified SDK
const sdk = new CowSdk({
  chainId: SupportedChainId.SEPOLIA,
  adapter,
  tradingOptions: {
    traderParams: {
      appCode: 'YOUR_APP_CODE',
    },
    options: {
      chainId: SupportedChainId.SEPOLIA,
    },
  },
})

const orderId = await sdk.trading.postSwapOrder(parameters)
const orders = await sdk.orderBook.getOrders({ owner: address })
const totals = await sdk.subgraph?.getTotals()
```

### Using individual modules from umbrella

You can also import specific modules directly from the umbrella SDK:

```typescript
import { TradingSdk } from '@cowprotocol/cow-sdk'
import { EthersV6Adapter } from '@cowprotocol/sdk-ethers-v6-adapter'
import { JsonRpcProvider, Wallet } from 'ethers'

const provider = new JsonRpcProvider('YOUR_RPC_URL')
const wallet = new Wallet('YOUR_PRIVATE_KEY', provider)
const adapter = new EthersV6Adapter({ provider, signer: wallet })

const trading = new TradingSdk(
  { appCode: 'YOUR_APP_CODE' }, // trader params
  { chainId: SupportedChainId.SEPOLIA }, // options
  adapter, // adapter required
)

const orderId = await trading.postSwapOrder(parameters)
```

### Using independent packages

For direct use of individual packages:

```typescript
import { TradingSdk } from '@cowprotocol/sdk-trading'
import { EthersV6Adapter } from '@cowprotocol/sdk-ethers-v6-adapter'
import { JsonRpcProvider, Wallet } from 'ethers'

const provider = new JsonRpcProvider('YOUR_RPC_URL')
const wallet = new Wallet('YOUR_PRIVATE_KEY', provider)
const adapter = new EthersV6Adapter({ provider, signer: wallet })

const trading = new TradingSdk(
  { appCode: 'YOUR_APP_CODE' }, // trader params
  { chainId: SupportedChainId.SEPOLIA }, // options
  adapter, // adapter required
)

const orderId = await trading.postSwapOrder(parameters)
```

## Adapters

The CoW SDK supports multiple blockchain adapters to work with different Web3 libraries. You need to install and configure one of the following adapters:

### Available Adapters

- **EthersV6Adapter** - For ethers.js v6
- **EthersV5Adapter** - For ethers.js v5
- **ViemAdapter** - For viem

### Installation

```bash
# For ethers v6
pnpm add @cowprotocol/sdk-ethers-v6-adapter ethers

# For ethers v5
pnpm add @cowprotocol/sdk-ethers-v5-adapter ethers@^5.7.0

# For viem
pnpm add @cowprotocol/sdk-viem-adapter viem
```

### Adapter Setup Examples

#### EthersV6Adapter

```typescript
import { EthersV6Adapter } from '@cowprotocol/sdk-ethers-v6-adapter'
import { JsonRpcProvider, Wallet } from 'ethers'

const provider = new JsonRpcProvider('YOUR_RPC_URL')
const wallet = new Wallet('YOUR_PRIVATE_KEY', provider)
const adapter = new EthersV6Adapter({ provider, signer: wallet })
```

#### EthersV5Adapter

```typescript
import { EthersV5Adapter } from '@cowprotocol/sdk-ethers-v5-adapter'
import { ethers } from 'ethers'

const provider = new ethers.providers.JsonRpcProvider('YOUR_RPC_URL')
const wallet = new ethers.Wallet('YOUR_PRIVATE_KEY', provider)
const adapter = new EthersV5Adapter({ provider, signer: wallet })
```

#### ViemAdapter

```typescript
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'
import { http, createWalletClient, privateKeyToAccount } from 'viem'
import { sepolia } from 'viem/chains'

const account = privateKeyToAccount('YOUR_PRIVATE_KEY' as `0x${string}`)
const transport = http('YOUR_RPC_URL')
const adapter = new ViemAdapter({ chain: sepolia, transport, account })
```

## [Trading SDK](https://github.com/cowprotocol/cow-sdk/blob/main/packages/trading/README.md)

CoW Protocol is intent based, decentralized trading protocol that allows users to trade ERC-20 tokens.

The basic swap flow:

1. 🔎 Get a quote (price) for a trade (_or define your own price with a limit order_)
2. ✍️ Sign the order
3. ✅ Post the order to the order-book

The easiest way to start trading is to use the `TradingSdk`:

```typescript
import { SupportedChainId, OrderKind, TradeParameters, TradingSdk } from '@cowprotocol/cow-sdk'
import { EthersV6Adapter } from '@cowprotocol/sdk-ethers-v6-adapter'
import { JsonRpcProvider, Wallet } from 'ethers'

// Configure the adapter
const provider = new JsonRpcProvider('YOUR_RPC_URL')
const wallet = new Wallet('YOUR_PRIVATE_KEY', provider)
const adapter = new EthersV6Adapter({ provider, signer: wallet })

// Initialize the SDK
const sdk = new TradingSdk(
  {
    appCode: '<YOUR_APP_CODE>',
  },
  {
    chainId: SupportedChainId.SEPOLIA,
  },
  adapter,
)

// Define trade parameters
const parameters: TradeParameters = {
  kind: OrderKind.BUY,
  sellToken: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
  sellTokenDecimals: 18,
  buyToken: '0x0625afb445c3b6b7b929342a04a22599fd5dbb59',
  buyTokenDecimals: 18,
  amount: '120000000000000000',
}

// Post the order
const orderId = await sdk.postSwapOrder(parameters)

console.log('Order created, id: ', orderId)
```

This example is the simplest way to trade on CoW Protocol.

You might want to use more advanced parameters like `receiver`, `partiallyFillable`, `validTo` and others.
Check the [Trading SDK documentation](https://github.com/cowprotocol/cow-sdk/blob/main/packages/trading/README.md) for more details.

## Other utilities

- `OrderBookApi` - provides the ability to retrieve orders and trades from the CoW Protocol order-book, as well as add and cancel them
- `OrderSigningUtils` - serves to sign orders and cancel them using [EIP-712](https://eips.ethereum.org/EIPS/eip-712)
- `SubgraphApi` - provides statistics data about CoW protocol from [Subgraph](https://github.com/cowprotocol/subgraph), such as trading volume, trade count and others

### Usage with Umbrella SDK

```typescript
import { CowSdk, SupportedChainId } from '@cowprotocol/cow-sdk'
import { EthersV6Adapter } from '@cowprotocol/sdk-ethers-v6-adapter'
import { JsonRpcProvider, Wallet } from 'ethers'

const provider = new JsonRpcProvider('YOUR_RPC_URL')
const wallet = new Wallet('YOUR_PRIVATE_KEY', provider)
const adapter = new EthersV6Adapter({ provider, signer: wallet })
const sdk = new CowSdk({
  chainId: SupportedChainId.SEPOLIA,
  adapter,
})

// All modules are available automatically
const orderBookApi = sdk.orderBook
const subgraphApi = sdk.subgraph
const orderSigningUtils = sdk.orderSigning
```

### Independent Package Usage

To use packages individually without the umbrella SDK, you must configure the adapter globally or pass it explicitly:

```typescript
import { OrderBookApi, SubgraphApi, OrderSigningUtils, setGlobalAdapter } from '@cowprotocol/cow-sdk'
import { EthersV6Adapter } from '@cowprotocol/sdk-ethers-v6-adapter'
import { JsonRpcProvider, Wallet } from 'ethers'

const chainId = SupportedChainId.SEPOLIA
const provider = new JsonRpcProvider('YOUR_RPC_URL')
const wallet = new Wallet('YOUR_PRIVATE_KEY', provider)
const adapter = new EthersV6Adapter({ provider, signer: wallet })

// Option 1: Configure the adapter globally
setGlobalAdapter(adapter)

const orderBookApi = new OrderBookApi({ chainId })
const subgraphApi = new SubgraphApi('API_KEY', { chainId })
const orderSigningUtils = new OrderSigningUtils()

// Option 2: Pass the adapter explicitly (when supported)
const orderSigningUtils = new OrderSigningUtils(adapter)
```

### Sign, fetch, post and cancel order

For clarity, let's look at the use of the API with a practical example:
Exchanging `0.4 GNO` to `WETH` on `Gnosis chain` network.

We will do the following operations:

1. Get a quote
2. Sign the order
3. Send the order to the order-book
4. Get the data of the created order
5. Get trades of the order
6. Cancel the order (signing + sending)

[You also can check this code in the CRA example](https://github.com/cowprotocol/cow-sdk/blob/main/examples/cra/src/pages/quickStart/index.tsx)

```typescript
import { OrderBookApi, OrderSigningUtils, SupportedChainId } from '@cowprotocol/cow-sdk'
import { EthersV6Adapter } from '@cowprotocol/sdk-ethers-v6-adapter'
import { JsonRpcProvider, Wallet } from 'ethers'

const account = 'YOUR_WALLET_ADDRESS'
const chainId = 100 // Gnosis chain
const provider = new JsonRpcProvider('YOUR_RPC_URL')
const wallet = new Wallet('YOUR_PRIVATE_KEY', provider)
const adapter = new EthersV6Adapter({ provider, signer: wallet })

const quoteRequest = {
  sellToken: '0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1', // WETH gnosis chain
  buyToken: '0x9c58bacc331c9aa871afd802db6379a98e80cedb', // GNO gnosis chain
  from: account,
  receiver: account,
  sellAmountBeforeFee: (0.4 * 10 ** 18).toString(), // 0.4 WETH
  kind: OrderQuoteSide.kind.SELL,
}

const orderBookApi = new OrderBookApi({ chainId: SupportedChainId.GNOSIS_CHAIN })

async function main() {
  const { quote } = await orderBookApi.getQuote(quoteRequest)

  const orderSigningResult = await OrderSigningUtils.signOrder(quote, chainId, adapter)

  const orderId = await orderBookApi.sendOrder({ ...quote, ...orderSigningResult })

  const order = await orderBookApi.getOrder(orderId)

  const trades = await orderBookApi.getTrades({ orderId })

  const orderCancellationSigningResult = await OrderSigningUtils.signOrderCancellations([orderId], chainId, adapter)

  const cancellationResult = await orderBookApi.sendSignedOrderCancellations({
    ...orderCancellationSigningResult,
    orderUids: [orderId],
  })

  console.log('Results: ', { orderId, order, trades, orderCancellationSigningResult, cancellationResult })
}
```

### OrderBookApi

`OrderBookApi` is the main tool for working with [CoW Protocol API](https://api.cow.fi/docs/#/).
You can use it with the global adapter (recommended):

```typescript
import { OrderBookApi, SupportedChainId, setGlobalAdapter } from '@cowprotocol/cow-sdk'
import { EthersV6Adapter } from '@cowprotocol/sdk-ethers-v6-adapter'
import { JsonRpcProvider, Wallet } from 'ethers'

const provider = new JsonRpcProvider('YOUR_RPC_URL')
const wallet = new Wallet('YOUR_PRIVATE_KEY', provider)
const adapter = new EthersV6Adapter({ provider, signer: wallet })
setGlobalAdapter(adapter)

const orderBookApi = new OrderBookApi({ chainId: SupportedChainId.GNOSIS_CHAIN })
```

Since the API supports different networks and environments, there are some options to configure it.

#### Environment configuration

`chainId` - can be one of `SupportedChainId.MAINNET`, `SupportedChainId.GNOSIS_CHAIN`, `SupportedChainId.ARBITRUM_ONE`, `SupportedChainId.BASE` or `SupportedChainId.SEPOLIA`

`env` - this parameter affects which environment will be used:

- `https://api.cow.fi` for `prod` (default)
- `https://barn.api.cow.fi` for `staging`

```typescript
import { OrderBookApi } from '@cowprotocol/cow-sdk'

const orderBookApi = new OrderBookApi({
  chainId: SupportedChainId.GNOSIS_CHAIN,
  env: 'staging', // <-----
})
```

#### API urls configuration

In case you need to use custom endpoints (e.g. you use a proxy), you can do it this way:

```typescript
import { OrderBookApi } from '@cowprotocol/cow-sdk'

const orderBookApi = new OrderBookApi({
  chainId: SupportedChainId.GNOSIS_CHAIN,
  baseUrls: {
    // <-----
    [SupportedChainId.MAINNET]: 'https://YOUR_ENDPOINT/mainnet',
    [SupportedChainId.GNOSIS_CHAIN]: 'https://YOUR_ENDPOINT/gnosis_chain',
    [SupportedChainId.ARBITRUM]: 'https://YOUR_ENDPOINT/arbitrum_one',
    [SupportedChainId.BASE]: 'https://YOUR_ENDPOINT/base',
    [SupportedChainId.SEPOLIA]: 'https://YOUR_ENDPOINT/sepolia',
    [SupportedChainId.POLYGON]: 'https://YOUR_ENDPOINT/polygon',
    [SupportedChainId.AVALANCHE]: 'https://YOUR_ENDPOINT/avalanche',
  },
})
```

The [CoW Protocol API](https://api.cow.fi/docs/#/) has restrictions on the backend side to protect against DDOS and other issues.

> The main restriction is request rate limit of: **5 requests per second for each IP address**

The _client's_ limiter settings can be configured as well:

```typescript
import { OrderBookApi } from '@cowprotocol/cow-sdk'
import { BackoffOptions } from 'exponential-backoff'
import { RateLimiterOpts } from 'limiter'

const limiterOpts: RateLimiterOpts = {
  tokensPerInterval: 5,
  interval: 'second',
}

const backOffOpts: BackoffOptions = {
  numOfAttempts: 5,
  maxDelay: Infinity,
  jitter: 'none',
}

const orderBookApi = new OrderBookApi({ chainId: SupportedChainId.GNOSIS_CHAIN, limiterOpts, backOffOpts })
```

## Architecture

One way to make the most out of the SDK is to get familiar with its architecture.

> See [SDK Architecture](https://github.com/cowprotocol/cow-sdk/blob/main/docs/architecture.md)

## Development

### Install Dependencies

```bash
pnpm install
```

### Build

```bash
pnpm build

# Build in watch mode
pnpm start
```

### Unit testing

```bash
pnpm test
```

### Code generation

Some parts of the SDK are automatically generated. This is the case for the Order Book API and the Subgraph API

```bash
# Re-create automatically generated code
pnpm codegen
```
