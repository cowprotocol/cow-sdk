<p align="center">
  <img width="400" src="https://github.com/cowprotocol/cow-sdk/raw/main/docs/images/CoW.png" />
</p>

# sdk-ethers-v5-adapter

This adapter provides integration with the ethers.js v5 library, enabling you to use all CoW Protocol SDK packages with ethers v5 providers and signers.

## Installation

Install the adapter:

```bash
npm install @cowprotocol/sdk-ethers-v5-adapter
# or
yarn add @cowprotocol/sdk-ethers-v5-adapter
# or
pnpm add @cowprotocol/sdk-ethers-v5-adapter
```

## Usage

### Basic Setup

```typescript
import { EthersV5Adapter } from '@cowprotocol/sdk-ethers-v5-adapter'
import { ethers } from 'ethers'

// Create provider and wallet
const provider = new ethers.providers.JsonRpcProvider('YOUR_RPC_URL')
const wallet = new ethers.Wallet('YOUR_PRIVATE_KEY', provider)

// Initialize the adapter
const adapter = new EthersV5Adapter({ provider, signer: wallet })
```

### Using with CoW SDK

```typescript
import { CowSdk, SupportedChainId } from '@cowprotocol/cow-sdk'
import { EthersV5Adapter } from '@cowprotocol/sdk-ethers-v5-adapter'
import { ethers } from 'ethers'

// Configure the adapter
const provider = new ethers.providers.JsonRpcProvider('YOUR_RPC_URL')
const wallet = new ethers.Wallet('YOUR_PRIVATE_KEY', provider)
const adapter = new EthersV5Adapter({ provider, signer: wallet })

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
import { EthersV5Adapter } from '@cowprotocol/sdk-ethers-v5-adapter'
import { ethers } from 'ethers'

const provider = new ethers.providers.JsonRpcProvider('YOUR_RPC_URL')
const wallet = new ethers.Wallet('YOUR_PRIVATE_KEY', provider)
const adapter = new EthersV5Adapter({ provider, signer: wallet })

const trading = new TradingSdk({ appCode: 'YOUR_APP_CODE' }, { chainId: SupportedChainId.SEPOLIA }, adapter)

const orderId = await trading.postSwapOrder(parameters)
```

## API Reference

### Constructor

```typescript
new EthersV5Adapter({ provider, signer })
```

#### Parameters

- `provider` - An ethers v5 provider instance
- `signer` - An ethers v5 signer instance

### Methods

The adapter implements the standard CoW Protocol adapter interface, providing methods for:

- Transaction signing
- Contract interactions
- Account management
- Chain information
