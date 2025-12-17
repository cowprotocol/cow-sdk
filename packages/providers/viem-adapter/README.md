<p align="center">
  <img width="400" src="https://github.com/cowprotocol/cow-sdk/raw/main/docs/images/CoW.png" />
</p>

# sdk-viem-adapter

This adapter provides integration with the viem library, enabling you to use all CoW Protocol SDK packages with viem clients and accounts.

## Installation

Install the adapter and its peer dependency:

```bash
npm install @cowprotocol/sdk-viem-adapter
# or
yarn add @cowprotocol/sdk-viem-adapter
# or
pnpm add @cowprotocol/sdk-viem-adapter
```

## Usage

### Basic Setup

```typescript
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'
import { http, createPublicClient, privateKeyToAccount } from 'viem'
import { sepolia } from 'viem/chains'

// Create account and transport
const account = privateKeyToAccount('YOUR_PRIVATE_KEY' as `0x${string}`)
const transport = http('YOUR_RPC_URL')
const provider = createPublicClient({ chain: sepolia, transport })

// Initialize the adapter
// You also can set `walletClient` instead of `signer` using `useWalletClient` from wagmi
const adapter = new ViemAdapter({ provider, signer: account })
```

### Using with CoW SDK

```typescript
import { CowSdk, SupportedChainId } from '@cowprotocol/cow-sdk'
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'
import { http, createPublicClient, privateKeyToAccount } from 'viem'
import { sepolia } from 'viem/chains'

// Configure the adapter
const account = privateKeyToAccount('YOUR_PRIVATE_KEY' as `0x${string}`)
const transport = http('YOUR_RPC_URL')
const provider = createPublicClient({ chain: sepolia, transport })
// You also can set `walletClient` instead of `signer` using `useWalletClient` from wagmi
const adapter = new ViemAdapter({ provider, signer: account })

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

// Use the SDK
const orderId = await sdk.trading.postSwapOrder(parameters)
const orders = await sdk.orderBook.getOrders({ owner: address })
```

### Using with Individual Packages

```typescript
import { TradingSdk } from '@cowprotocol/sdk-trading'
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'
import { http, createPublicClient, privateKeyToAccount } from 'viem'
import { sepolia } from 'viem/chains'

const account = privateKeyToAccount('YOUR_PRIVATE_KEY' as `0x${string}`)
const transport = http('YOUR_RPC_URL')
const provider = createPublicClient({ chain: sepolia, transport })
const adapter = new ViemAdapter({ provider, signer: account })

const trading = new TradingSdk({ appCode: 'YOUR_APP_CODE' }, { chainId: SupportedChainId.SEPOLIA }, adapter)

const orderId = await trading.postSwapOrder(parameters)
```

## API Reference

### Constructor

```typescript
new ViemAdapter({ provider, signer })
```

#### Parameters

- `provider` - A viem PublicClient instance
- `signer` - A viem account instance or private key

### Methods

The adapter implements the standard CoW Protocol adapter interface, providing methods for:

- Transaction signing
- Contract interactions
- Account management
- Chain information
