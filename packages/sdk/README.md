<p align="center">
  <img width="400" src="https://github.com/cowprotocol/cow-sdk/raw/main/docs/images/CoW.png" />
</p>

# CoW SDK - Umbrella Package

The **CoW SDK Umbrella Package** is the comprehensive entry point for developers who want to access all CoW Protocol functionalities in a single, unified package. This is the recommended way to interact with CoW Protocol as it provides seamless integration across all SDK modules.

## 🎯 **Why Use the Umbrella Package?**

- **All-in-One Solution** - Single installation gives you access to all CoW Protocol features
- **Unified API** - Access all modules through one `CowSdk` instance or import them individually
- **Simplified Setup** - Adapter configuration is handled once and shared across all modules
- **Future-Proof** - Automatically includes new features and modules as they're added

## 📚 **Documentation Hub**

This package serves as the **main entry point** for all CoW Protocol SDK documentation. Each individual package has its own detailed documentation, but everything starts here.

### 📂 **SDK Structure**

```
├── @cowprotocol/cow-sdk (Umbrella - All packages included) 🏠
│
├── Provider Adapters
│   ├── @cowprotocol/sdk-ethers-v5-adapter
│   ├── @cowprotocol/sdk-ethers-v6-adapter
│   └── @cowprotocol/sdk-viem-adapter
│
├── Core Utilities
│   ├── @cowprotocol/sdk-common
│   ├── @cowprotocol/sdk-config
│   └── @cowprotocol/sdk-contracts-ts
│
├── Protocol Components
│   ├── @cowprotocol/sdk-order-signing
│   ├── @cowprotocol/sdk-order-book
│   ├── @cowprotocol/sdk-app-data
│   ├── @cowprotocol/sdk-trading
│   ├── @cowprotocol/sdk-composable
│   ├── @cowprotocol/sdk-cow-shed
│   ├── @cowprotocol/sdk-subgraph
│   └── @cowprotocol/sdk-bridging
│
└── Additional Packages
    └── @cowprotocol/app-data
```

## 🚀 **Getting Started**

### Installation

```bash
npm install @cowprotocol/cow-sdk
# or
pnpm add @cowprotocol/cow-sdk
# or
yarn add @cowprotocol/cow-sdk
```

You'll also need one of the adapter packages:

```bash
# Choose one based on your Web3 library preference
npm install @cowprotocol/sdk-ethers-v6-adapter
npm install @cowprotocol/sdk-ethers-v5-adapter
npm install @cowprotocol/sdk-viem-adapter
```

## 💡 **Usage Patterns**

The umbrella package offers three flexible usage patterns:

### 1. **Unified CowSdk Instance** (Recommended)

Access all modules through a single SDK instance:

```typescript
import {
  TradingSdk,
  OrderBookApi,
  OrderSigningUtils,
  setGlobalAdapter,
  SupportedChainId
} from '@cowprotocol/cow-sdk'
import { EthersV6Adapter } from '@cowprotocol/sdk-ethers-v6-adapter'
import { JsonRpcProvider, Wallet } from 'ethers'

// Configure the adapter once
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
      ...
    },
    ...
  },
})

// Use all modules seamlessly
const orderId = await sdk.trading.postSwapOrder(parameters)
const orders = await sdk.orderBook.getOrders({ owner: address })
const totals = await sdk.subgraph?.getTotals()
const signature = await sdk.orderSigning.signOrder(order, chainId, signer)
```

### 2. **Direct Module Import** (Simplified)

Import modules directly from the umbrella package without the unified instance:

```typescript
import { TradingSdk, OrderBookApi, SupportedChainId, OrderKind, TradeParameters } from '@cowprotocol/cow-sdk'
import { EthersV6Adapter } from '@cowprotocol/sdk-ethers-v6-adapter'
import { JsonRpcProvider, Wallet } from 'ethers'

// Configure adapter
const provider = new JsonRpcProvider('YOUR_RPC_URL')
const wallet = new Wallet('YOUR_PRIVATE_KEY', provider)
const adapter = new EthersV6Adapter({ provider, signer: wallet })

// Use modules individually - adapter configuration is handled automatically
const trading = new TradingSdk({ appCode: 'YOUR_APP_CODE' }, { chainId: SupportedChainId.SEPOLIA }, adapter)

const orderBook = new OrderBookApi({ chainId: SupportedChainId.SEPOLIA })

// All modules work together seamlessly
const orderId = await trading.postSwapOrder(parameters)
const orders = await orderBook.getOrders({ owner: address })
```

### 3. **Global Adapter Configuration**

Set up the adapter once and use modules without explicit adapter passing:

```typescript
import { TradingSdk, OrderBookApi, OrderSigningUtils, setGlobalAdapter, SupportedChainId } from '@cowprotocol/cow-sdk'
import { EthersV6Adapter } from '@cowprotocol/sdk-ethers-v6-adapter'
import { JsonRpcProvider, Wallet } from 'ethers'

// Configure adapter globally
const provider = new JsonRpcProvider('YOUR_RPC_URL')
const wallet = new Wallet('YOUR_PRIVATE_KEY', provider)
const adapter = new EthersV6Adapter({ provider, signer: wallet })
setGlobalAdapter(adapter)

// Now use modules without passing adapter each time
const trading = new TradingSdk({ appCode: 'YOUR_APP_CODE' }, { chainId: SupportedChainId.SEPOLIA })

const orderBook = new OrderBookApi({ chainId: SupportedChainId.SEPOLIA })

// Use OrderSigningUtils directly - no need to instantiate
// const orderSigning = OrderSigningUtils  // or simply use OrderSigningUtils.signOrder(...)
```

## 🧩 **Available Modules**

All modules are accessible through the umbrella package:

> **📖 Documentation**: All links below point to the official documentation at [docs.cow.fi](https://docs.cow.fi). For source code, visit the [GitHub repository](https://github.com/cowprotocol/cow-sdk).

### **Trading**

```typescript
import { TradingSdk } from '@cowprotocol/cow-sdk'
```

Create and manage orders, get quotes, handle swaps and limit orders.
[📖 Trading Documentation](https://docs.cow.fi/cow-protocol/reference/sdks/protocol-components/sdk-trading)

### **Order Book**

```typescript
import { OrderBookApi } from '@cowprotocol/cow-sdk'
```

Interact with CoW Protocol's order book API for order management.
[📖 Order Book Documentation](https://docs.cow.fi/cow-protocol/reference/sdks/protocol-components/sdk-order-book)

### **Order Signing**

```typescript
import { OrderSigningUtils } from '@cowprotocol/cow-sdk'
```

Handle EIP-712 order signing and cancellations.
[📖 Order Signing Documentation](https://docs.cow.fi/cow-protocol/reference/sdks/protocol-components/sdk-order-signing)

### **App Data**

```typescript
import { MetadataApi } from '@cowprotocol/cow-sdk'
```

Manage order metadata and application-specific data.
[📖 App Data Documentation](https://docs.cow.fi/cow-protocol/reference/sdks/app-data)

### **Subgraph**

```typescript
import { SubgraphApi } from '@cowprotocol/cow-sdk'
```

Access CoW Protocol analytics and historical data.
[📖 Subgraph Documentation](https://docs.cow.fi/cow-protocol/reference/sdks/protocol-components/sdk-subgraph)

### **Contracts**

```typescript
import { ContractsTs } from '@cowprotocol/cow-sdk'
```

TypeScript contract interfaces for CoW Protocol smart contracts.
[📖 Contracts Documentation](https://docs.cow.fi/cow-protocol/reference/sdks/core-utilities/sdk-contracts-ts)

### **Composable CoW**

```typescript
import { ConditionalOrderFactory, Multiplexer } from '@cowprotocol/cow-sdk'
```

Advanced conditional and programmable orders.
[📖 Composable Documentation](https://docs.cow.fi/cow-protocol/reference/sdks/protocol-components/sdk-composable)

### **CoW Shed**

```typescript
import { CowShedSdk } from '@cowprotocol/cow-sdk'
```

Batch transaction and intent management utilities.
[📖 CoW Shed Documentation](https://docs.cow.fi/cow-protocol/reference/sdks/protocol-components/sdk-cow-shed)

## ⚙️ **Adapter Support**

The umbrella package works with all supported blockchain adapters:

### **Ethers v6**

```typescript
import { EthersV6Adapter } from '@cowprotocol/sdk-ethers-v6-adapter'
import { JsonRpcProvider, Wallet } from 'ethers'

const provider = new JsonRpcProvider('YOUR_RPC_URL')
const wallet = new Wallet('YOUR_PRIVATE_KEY', provider)
const adapter = new EthersV6Adapter({ provider, signer: wallet })
```

### **Ethers v5**

```typescript
import { EthersV5Adapter } from '@cowprotocol/sdk-ethers-v5-adapter'
import { ethers } from 'ethers'

const provider = new ethers.providers.JsonRpcProvider('YOUR_RPC_URL')
const wallet = new ethers.Wallet('YOUR_PRIVATE_KEY', provider)
const adapter = new EthersV5Adapter({ provider, signer: wallet })
```

### **Viem**

```typescript
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'
import { http, createWalletClient, privateKeyToAccount } from 'viem'
import { sepolia } from 'viem/chains'

const account = privateKeyToAccount('YOUR_PRIVATE_KEY' as `0x${string}`)
const transport = http('YOUR_RPC_URL')
const adapter = new ViemAdapter({ chain: sepolia, transport, account })
```

## 🌐 **Supported Networks**

The SDK supports all CoW Protocol enabled networks:

- **Ethereum** (1) - `SupportedChainId.MAINNET`
- **Gnosis Chain** (100) - `SupportedChainId.GNOSIS_CHAIN`
- **Arbitrum One** (42161) - `SupportedChainId.ARBITRUM_ONE`
- **Base** (8453) - `SupportedChainId.BASE`
- **Polygon** (137) - `SupportedChainId.POLYGON`
- **Avalanche** (43114) - `SupportedChainId.AVALANCHE`
- **Sepolia** (11155111) - `SupportedChainId.SEPOLIA` (Testnet)

## 📝 **Quick Example: Complete Trading Flow**

```typescript
import { CowSdk, SupportedChainId, OrderKind, TradeParameters } from '@cowprotocol/cow-sdk'
import { EthersV6Adapter } from '@cowprotocol/sdk-ethers-v6-adapter'
import { JsonRpcProvider, Wallet } from 'ethers'

async function main() {
  // Setup
  const provider = new JsonRpcProvider('YOUR_RPC_URL')
  const wallet = new Wallet('YOUR_PRIVATE_KEY', provider)
  const adapter = new EthersV6Adapter({ provider, signer: wallet })

  const sdk = new CowSdk({
    chainId: SupportedChainId.SEPOLIA,
    adapter,
    tradingOptions: {
      traderParams: { appCode: 'MY_APP' },
    },
  })

  // Define trade
  const tradeParams: TradeParameters = {
    kind: OrderKind.SELL,
    sellToken: '0xfff9976782d46cc05630d1f6ebab18b2324d6b14', // WETH
    sellTokenDecimals: 18,
    buyToken: '0x0625afb445c3b6b7b929342a04a22599fd5dbb59', // GNO
    buyTokenDecimals: 18,
    amount: '100000000000000000', // 0.1 WETH
  }

  // Execute trade
  const orderId = await sdk.trading.postSwapOrder(tradeParams)
  console.log('Order created:', orderId)

  // Monitor order
  const order = await sdk.orderBook.getOrder(orderId)
  console.log('Order status:', order.status)

  // Get historical data
  const stats = await sdk.subgraph?.getTotals()
  console.log('Protocol stats:', stats)
}

main().catch(console.error)
```

## 🏗️ **Architecture**

To understand how all the pieces fit together, see our architecture documentation:

> 📖 **[SDK Architecture Guide](https://github.com/cowprotocol/cow-sdk/blob/main/docs/architecture.md)**

## 🔗 **Related Resources**

- **[CoW Protocol Documentation](https://docs.cow.fi/)**
- **[API Reference](https://api.cow.fi/docs/)**
- **[CoW Protocol Website](https://cow.fi/)**
- **[Examples Repository](https://github.com/cowprotocol/cow-sdk/tree/main/examples)**
- **Issues**: [GitHub Issues](https://github.com/cowprotocol/cow-sdk/issues)
- **Discord**: [CoW Protocol Discord](https://discord.com/invite/cowprotocol)
- **Documentation**: [docs.cow.fi](https://docs.cow.fi/)

---

> **💡 Tip**: Start with the umbrella package and the unified `CowSdk` instance for the best developer experience. You can always optimize later by using individual modules if needed.
