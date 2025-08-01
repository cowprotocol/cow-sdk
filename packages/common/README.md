<p align="center">
  <img width="400" src="https://github.com/cowprotocol/cow-sdk/raw/main/docs/images/CoW.png" />
</p>

# SDK Common

This package is part of the core CoW Protocol SDK. It doesn't have significant standalone functionality, but provides access to important types, interfaces, and utilities that are shared across all SDK packages.

## What's included

- **Abstract Provider Adapters** - Base classes for blockchain interactions
- **Shared Types** - Common interfaces and types used throughout the SDK
- **Utilities** - Helper functions and common utilities
- **Global Context** - Shared adapter context between packages

## Installation

```bash
npm install @cowprotocol/sdk-common
```

## Usage

### Individual package usage

```typescript
import {
  AbstractProviderAdapter,
  AdapterTypes,
  Block,
  TransactionParams,
  PrivateKey,
  CowError,
  GenericContract,
  setGlobalAdapter,
} from '@cowprotocol/sdk-common'
import { EthersV6Adapter } from '@cowprotocol/sdk-ethers-v6-adapter'
import { JsonRpcProvider, Wallet } from 'ethers'

// Create and configure adapter
const provider = new JsonRpcProvider('YOUR_RPC_URL')
const wallet = new Wallet('YOUR_PRIVATE_KEY', provider)
const adapter = new EthersV6Adapter({ provider, signer: wallet })

// Set up global adapter
setGlobalAdapter(adapter)

// Use shared types and utilities
const txParams: TransactionParams = {
  to: '0x...',
  data: '0x...',
  value: '0',
}
```

### Usage with Umbrella SDK

When using the umbrella SDK, these common utilities are automatically available:

```typescript
import {
  CowSdk,
  AbstractProviderAdapter,
  AdapterTypes,
  Block,
  TransactionParams,
  PrivateKey,
  CowError,
  GenericContract,
} from '@cowprotocol/cow-sdk'
```

> **Note:** This package is primarily designed to be used as a dependency by other SDK packages rather than directly by end users. Most developers should use the umbrella `@cowprotocol/cow-sdk` package or specific feature packages like `@cowprotocol/sdk-trading`.
