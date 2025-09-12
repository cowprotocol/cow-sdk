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

**Usage examples:**

- React (viem): https://github.com/cowprotocol/cow-sdk/tree/main/examples/react/viem
- React (ethers v6): https://github.com/cowprotocol/cow-sdk/tree/main/examples/react/ethers6
- React (ethers v5): https://github.com/cowprotocol/cow-sdk/tree/main/examples/react/ethers5


- Node.js (viem): https://github.com/cowprotocol/cow-sdk/blob/main/examples/nodejs/viem/src/index.ts
- Node.js (ethers v6): https://github.com/cowprotocol/cow-sdk/blob/main/examples/nodejs/ethers6/src/index.ts
- Node.js (ethers v5): https://github.com/cowprotocol/cow-sdk/blob/main/examples/nodejs/ethers5/src/index.ts

### Installation

```bash
pnpm add @cowprotocol/cow-sdk
```

```bash
yarn add @cowprotocol/cow-sdk
```

## CoW SDK

Using CoW Protocol, you can perform swaps, limit orders, TWAP orders, and many other operations.
`@cowprotocol/cow-sdk` provides tools at different abstraction levels, allowing you to conveniently implement basic scenarios while maintaining the flexibility to control all possible cases.

## SDK Components

### Core
- **[`TradingSdk`](packages/trading/README.md)** - Main tool for swap and limit orders with built-in quote fetching, order signing, and posting
- **[`OrderSigningUtils`](packages/order-signing/README.md)** - Utilities for signing orders and cancellations using cryptographic algorithms
- **[`OrderBookApi`](packages/order-book/README.md)** - Provides the ability to retrieve orders and trades from the CoW Protocol order-book, as well as add and cancel them
- **[`MetadataApi`](packages/app-data/README.md)** - API for accessing order metadata and additional information

### Advanced
- **[`BridgingSdk`](packages/bridging/README.md)** - Cross-chain token transfers and bridging functionality
- **[`ConditionalOrder`](packages/composable/README.md)** - SDK for Programmatic Orders such as TWAP. [Read more in docs.cow.fi](https://docs.cow.fi/cow-protocol/concepts/order-types/programmatic-orders)
- **[`CowShedSdk`](packages/cow-shed/README.md)** - Account abstraction that leverages EOA with smart contract capabilities

## Basic Use Case
This example demonstrates the main use case of creating a swap and shows how to:
 - get a quote
 - verify amounts
 - adjust swap parameters
 - sign and post order

```typescript
import { SupportedChainId, OrderKind, TradeParameters, TradingSdk } from '@cowprotocol/cow-sdk'
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'
import { createPublicClient, http, privateKeyToAccount } from 'viem'
import { sepolia } from 'viem/chains'

// There are EthersV5Adapter and EthersV6Adapter as well
// @cowprotocol/sdk-ethers-v5-adapter, @cowprotocol/sdk-ethers-v6-adapter
const adapter = new ViemAdapter({
  provider: createPublicClient({
    chain: sepolia,
    transport: http('YOUR_RPC_URL')
  }),
  signer: privateKeyToAccount('YOUR_PRIVATE_KEY' as `0x${string}`)
})

const sdk = new TradingSdk({
  chainId: SupportedChainId.SEPOLIA,
  appCode: 'YOUR_APP_CODE',
}, {}, adapter)

const parameters: TradeParameters = {
  kind: OrderKind.SELL,
  sellToken: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14',
  sellTokenDecimals: 18,
  buyToken: '0x0625afb445c3b6b7b929342a04a22599fd5dbb59',
  buyTokenDecimals: 18,
  amount: '120000000000000',
}

// Get quote
const { quoteResults, postSwapOrderFromQuote } = await sdk.getQuote(parameters)

const buyAmount = quoteResults.amountsAndCosts.afterSlippage.buyAmount

// Verify amount
if (confirm(`You will receive at least: ${buyAmount}. Proceed?`)) {
  // Sign and post order
  const orderId = await postSwapOrderFromQuote()

  console.log('Order created, id: ', orderId)
}
```

This example demonstrates the simplest way to trade on CoW Protocol.

For more advanced use cases, you can use additional parameters such as `receiver`, `partiallyFillable`, `validTo`, and others.
Refer to the [Trading SDK documentation](packages/trading/README.md) for comprehensive details.


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
import { http, createPublicClient, privateKeyToAccount } from 'viem'
import { sepolia } from 'viem/chains'

const account = privateKeyToAccount('YOUR_PRIVATE_KEY' as `0x${string}`)
const transport = http('YOUR_RPC_URL')
const provider = createPublicClient({ chain: sepolia, transport })
const adapter = new ViemAdapter({ provider, signer: account })
```

## Low-Level SDK Usage Example

This example demonstrates low-level API usage with a practical scenario:
exchanging `0.4 GNO` for `WETH` on the Gnosis Chain network.

We will do the following operations:

1. Get a quote
2. Sign the order
3. Send the order to the order-book
4. Get the data of the created order
5. Get trades of the order
6. Cancel the order (signing + sending)

```typescript
import { OrderBookApi, OrderSigningUtils, SupportedChainId, OrderKind } from '@cowprotocol/cow-sdk'
import { EthersV6Adapter } from '@cowprotocol/sdk-ethers-v6-adapter'
import { JsonRpcProvider, Wallet } from 'ethers'

const account = 'YOUR_WALLET_ADDRESS'
const chainId = 100 // Gnosis chain
const provider = new JsonRpcProvider('YOUR_RPC_URL')
const wallet = new Wallet('YOUR_PRIVATE_KEY', provider)
const adapter = new EthersV6Adapter({ provider, signer: wallet })

const quoteRequest = {
  sellToken: '0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1', // WETH on Gnosis Chain
  buyToken: '0x9c58bacc331c9aa871afd802db6379a98e80cedb', // GNO on Gnosis Chain
  from: account,
  receiver: account,
  sellAmountBeforeFee: (0.4 * 10 ** 18).toString(), // 0.4 WETH
  kind: OrderKind.SELL,
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
