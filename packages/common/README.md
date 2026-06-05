<p align="center">
  <img width="400" src="https://github.com/cowprotocol/cow-sdk/raw/main/docs/images/CoW.png" />
</p>

# SDK Common

## Test coverage

| Statements                  | Branches                | Functions                 | Lines             |
| --------------------------- | ----------------------- | ------------------------- | ----------------- |
| ![Statements](https://img.shields.io/badge/statements-16.1%25-red.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-23.23%25-red.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-12.82%25-red.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-14.15%25-red.svg?style=flat) |

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
import { ViemAdapter } from '@cowprotocol/sdk-viem-adapter'
import { createPublicClient, http, privateKeyToAccount } from 'viem'
import { sepolia } from 'viem/chains'

// Create and configure adapter
// There are EthersV5Adapter and EthersV6Adapter as well
// @cowprotocol/sdk-ethers-v5-adapter, @cowprotocol/sdk-ethers-v6-adapter
const adapter = new ViemAdapter({
  provider: createPublicClient({
    chain: sepolia,
    transport: http('YOUR_RPC_URL')
  }),
  // You also can set `walletClient` instead of `signer` using `useWalletClient` from wagmi
  signer: privateKeyToAccount('YOUR_PRIVATE_KEY' as `0x${string}`)
})

// Set up global adapter
setGlobalAdapter(adapter)

// Use shared types and utilities
const txParams: TransactionParams = {
  to: '0x...',
  data: '0x...',
  value: '0',
}
```

### Usage with CoW SDK

When using the CoW SDK, these common utilities are automatically available:

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

> **Note:** This package is primarily designed to be used as a dependency by other SDK packages rather than directly by end users. Most developers should use `@cowprotocol/cow-sdk` package or specific feature packages like `@cowprotocol/sdk-trading`.
