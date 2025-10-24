<p align="center">
  <img width="400" src="https://github.com/cowprotocol/cow-sdk/raw/main/docs/images/CoW.png" />
</p>

# CoW SDK

## 📚 [Docs website](https://docs.cow.fi/)

## Test coverage

| Statements                                                                                 | Branches                                                                       | Functions                                                                                | Lines                                                                            |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| ![Statements](https://img.shields.io/badge/statements-94.77%25-brightgreen.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-76.78%25-red.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-97.43%25-brightgreen.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-97.67%25-brightgreen.svg?style=flat) |


## 🌐 **Supported Networks**

The SDK supports all CoW Protocol enabled networks:

- **Ethereum** (1) - `SupportedChainId.MAINNET`
- **Gnosis Chain** (100) - `SupportedChainId.GNOSIS_CHAIN`
- **Arbitrum One** (42161) - `SupportedChainId.ARBITRUM_ONE`
- **Base** (8453) - `SupportedChainId.BASE`
- **Polygon** (137) - `SupportedChainId.POLYGON`
- **Avalanche** (43114) - `SupportedChainId.AVALANCHE`
- **Lens** (232) - `SupportedChainId.LENS`
- **BNB** (56) - `SupportedChainId.BNB`
- **Linea** (59144) - `SupportedChainId.LINEA` (Under development)
- **Plasma** (9745) - `SupportedChainId.PLASMA` (Under development)
- **Sepolia** (11155111) - `SupportedChainId.SEPOLIA` (Testnet)

## 🔗 **Related Resources**

- **[CoW Protocol Documentation](https://docs.cow.fi/)**
- **[API Reference](https://api.cow.fi/docs/)**
- **[CoW Protocol Website](https://cow.fi/)**
- **[Examples Repository](https://github.com/cowprotocol/cow-sdk/tree/main/examples)**
- **Issues**: [GitHub Issues](https://github.com/cowprotocol/cow-sdk/issues)
- **Discord**: [CoW Protocol Discord](https://discord.com/invite/cowprotocol)
- **Documentation**: [docs.cow.fi](https://docs.cow.fi/)

## Getting Started

### Usage Examples

**React Examples:**
- [React (viem)](https://github.com/cowprotocol/cow-sdk/tree/main/examples/react/viem)
- [React (wagmi)](https://github.com/cowprotocol/cow-sdk/tree/main/examples/react/wagmi)
- [React (ethers v6)](https://github.com/cowprotocol/cow-sdk/tree/main/examples/react/ethers6)
- [React (ethers v5)](https://github.com/cowprotocol/cow-sdk/tree/main/examples/react/ethers5)

**Node.js Examples:**
- [Node.js (viem)](https://github.com/cowprotocol/cow-sdk/blob/main/examples/nodejs/viem/src/index.ts)
- [Node.js (ethers v6)](https://github.com/cowprotocol/cow-sdk/blob/main/examples/nodejs/ethers6/src/index.ts)
- [Node.js (ethers v5)](https://github.com/cowprotocol/cow-sdk/blob/main/examples/nodejs/ethers5/src/index.ts)

### Installation

```bash
pnpm add @cowprotocol/cow-sdk
```

```bash
yarn add @cowprotocol/cow-sdk
```

## CoW SDK

Using CoW Protocol, you can perform swaps, limit orders, TWAP orders, and many other operations.
The `@cowprotocol/cow-sdk` provides tools at different abstraction levels, allowing you to conveniently implement basic scenarios while maintaining the flexibility to control all possible cases.

> In most cases, you will only need to use the **[Trading SDK](https://github.com/cowprotocol/cow-sdk/tree/main/packages/trading/README.md)**

## SDK Components

### Core
- **[`TradingSdk`](https://github.com/cowprotocol/cow-sdk/tree/main/packages/trading/README.md)** - Main tool for swap and limit orders with built-in quote fetching, order signing, and posting
- **[`OrderSigningUtils`](https://github.com/cowprotocol/cow-sdk/tree/main/packages/order-signing/README.md)** - Utilities for signing orders and cancellations using cryptographic algorithms
- **[`OrderBookApi`](https://github.com/cowprotocol/cow-sdk/tree/main/packages/order-book/README.md)** - Provides the ability to retrieve orders and trades from the CoW Protocol order book, as well as add and cancel them
- **[`MetadataApi`](https://github.com/cowprotocol/cow-sdk/tree/main/packages/app-data/README.md)** - API for accessing order metadata and additional information

### Advanced
- **[`BridgingSdk`](https://github.com/cowprotocol/cow-sdk/tree/main/packages/bridging/README.md)** - Cross-chain token transfers and bridging functionality
- **[`ConditionalOrder`](https://github.com/cowprotocol/cow-sdk/tree/main/packages/composable/README.md)** - SDK for Programmatic Orders such as TWAP ([Read more](https://docs.cow.fi/cow-protocol/concepts/order-types/programmatic-orders))
- **[`CowShedSdk`](https://github.com/cowprotocol/cow-sdk/tree/main/packages/cow-shed/README.md)** - Account abstraction that leverages EOA with smart contract capabilities

## v6 → v7 Migration Guide
The versions are 99% backward compatible. The only difference is that in v7 you need to set an adapter corresponding to the library you use: `Viem`, `Ethers6`, or `Ethers5`.

**Before (v6):**
```typescript
import { SupportedChainId, TradingSdk, MetadataApi, OrderBookApi } from '@cowprotocol/cow-sdk'

const options = {}

const sdk = new TradingSdk({
  chainId: SupportedChainId.SEPOLIA,
  appCode: 'YOUR_APP_CODE',
}, options)
```

**After (v7):**
```typescript
import { SupportedChainId, OrderKind, TradeParameters, TradingSdk } from '@cowprotocol/cow-sdk'
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'
import { createPublicClient, http, privateKeyToAccount } from 'viem'
import { sepolia } from 'viem/chains'

// NEW: Instantiate and set adapter
const adapter = new ViemAdapter({
  provider: createPublicClient({
    chain: sepolia,
    transport: http('YOUR_RPC_URL')
  }),
  // You can also set `walletClient` instead of `signer` using `useWalletClient` from wagmi
  signer: privateKeyToAccount('YOUR_PRIVATE_KEY' as `0x${string}`)
})

const options = {}

const sdk = new TradingSdk({
  chainId: SupportedChainId.SEPOLIA,
  appCode: 'YOUR_APP_CODE',
}, options, adapter)
```

Most other packages (e.g., `MetadataApi` or `BridgingSdk`) have a parameter to set an adapter.
You can also set an adapter using `setGlobalAdapter`:

```typescript
import { setGlobalAdapter, CowShedSdk } from '@cowprotocol/cow-sdk'

const adapter = {...}

// Set global adapter
setGlobalAdapter(adapter)

const cowShedSdk = new CowShedSdk()
```

You will likely also need to bind the SDK to your app's account state.
When the account or network changes in the app/wallet, it should be updated in the SDK as well.
Here's an example for `WAGMI` (see `examples/react/wagmi`):

```typescript
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import { useEffect, useState } from 'react'
import { ViemAdapter, ViemAdapterOptions } from '@cowprotocol/sdk-viem-adapter'
import { tradingSdk } from '../cowSdk.ts'
import { setGlobalAdapter } from '@cowprotocol/cow-sdk'

export function useBindCoWSdkToWagmi(): boolean {
  const { chainId } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()

  const [isSdkReady, setIsSdkReady] = useState(false)

  /**
   * Sync Trading SDK with wagmi account state (chainId and signer)
   */
  useEffect(() => {
    if (!walletClient || !chainId) return

    setGlobalAdapter(
      new ViemAdapter({
        provider: publicClient,
        walletClient,
      } as unknown as ViemAdapterOptions),
    )

    tradingSdk.setTraderParams({ chainId })

    setIsSdkReady(true)
  }, [publicClient, walletClient, chainId])

  return isSdkReady
}

```

## Basic Use Case
This example demonstrates the main use case of creating a swap and shows how to:
- Get a quote
- Verify amounts
- Adjust swap parameters
- Sign and post an order

```typescript
import { SupportedChainId, OrderKind, TradeParameters, TradingSdk } from '@cowprotocol/cow-sdk'
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'
import { createPublicClient, http, privateKeyToAccount } from 'viem'
import { sepolia } from 'viem/chains'

// EthersV5Adapter and EthersV6Adapter are also available
// @cowprotocol/sdk-ethers-v5-adapter, @cowprotocol/sdk-ethers-v6-adapter
const adapter = new ViemAdapter({
  provider: createPublicClient({
    chain: sepolia,
    transport: http('YOUR_RPC_URL')
  }),
  // You can also set `walletClient` instead of `signer` using `useWalletClient` from wagmi
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

  console.log('Order created, ID:', orderId)
}
```

This example demonstrates the simplest way to trade on CoW Protocol.

For more advanced use cases, you can use additional parameters such as `receiver`, `partiallyFillable`, `validTo`, and others.
Refer to the [Trading SDK documentation](https://github.com/cowprotocol/cow-sdk/tree/main/packages/trading/README.md) for comprehensive details.


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

// You can also set `walletClient` instead of `signer` using `useWalletClient` from wagmi
const adapter = new ViemAdapter({ provider, signer: account })
```

## Low-Level SDK Usage Example

This example demonstrates low-level API usage with a practical scenario:
exchanging `0.4 GNO` for `WETH` on the Gnosis Chain network.

We will perform the following operations:

1. Get a quote
2. Sign the order
3. Send the order to the order book
4. Get the data of the created order
5. Get trades for the order
6. Cancel the order (signing + sending)

```typescript
import { OrderBookApi, OrderSigningUtils, SupportedChainId, OrderKind } from '@cowprotocol/cow-sdk'
import { EthersV6Adapter } from '@cowprotocol/sdk-ethers-v6-adapter'
import { JsonRpcProvider, Wallet } from 'ethers'

const account = 'YOUR_WALLET_ADDRESS'
const chainId = 100 // Gnosis Chain
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

  console.log('Results:', { orderId, order, trades, orderCancellationSigningResult, cancellationResult })
}
```
