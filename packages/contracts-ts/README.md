<p align="center">
  <img width="400" src="https://github.com/cowprotocol/cow-sdk/raw/main/docs/images/CoW.png" />
</p>

# SDK Contracts

This package provides TypeScript contract interfaces and utilities for interacting with CoW Protocol smart contracts. It includes type-safe contract wrappers and helper functions for all CoW Protocol contracts.

## Package Origin

This package represents a migration and modularization of the TypeScript utilities that were previously located in the [contracts repository](https://github.com/cowprotocol/contracts/tree/main/src/ts). The contract interaction logic has been extracted from the main contracts repository and reorganized into this dedicated SDK package to:

- **Improve modularity** - Separate smart contract deployment code from client-side interaction utilities
- **Enable independent versioning** - Allow contract interfaces to evolve independently from contract deployments
- **Better developer experience** - Provide a focused package specifically for TypeScript developers
- **SDK integration** - Seamlessly integrate with the broader CoW Protocol SDK ecosystem

## What's included

- **Contract Interfaces** - TypeScript interfaces for all CoW Protocol smart contracts
- **Contract Utilities** - Helper functions for contract interactions
- **Type Safety** - Full TypeScript support with proper typing
- **Multi-Chain Support** - Contract addresses and interfaces for all supported chains

## Installation

```bash
npm install @cowprotocol/sdk-contracts-ts
```

## Usage

```typescript
import { ContractsTs } from '@cowprotocol/sdk-contracts-ts'
import { EthersV6Adapter } from '@cowprotocol/sdk-ethers-v6-adapter'
import { JsonRpcProvider, Wallet } from 'ethers'

// Configure the adapter
const provider = new JsonRpcProvider('YOUR_RPC_URL')
const wallet = new Wallet('YOUR_PRIVATE_KEY', provider)
const adapter = new EthersV6Adapter({ provider, signer: wallet })

// Initialize contracts with adapter
const contracts = new ContractsTs(adapter)

// Use contract interfaces
const settlementContract = contracts.settlement()
const vaultRelayerContract = contracts.vaultRelayer()
```

### Usage with CoW SDK

When using the CoW SDK, contract utilities are automatically available:

```typescript
import {
  CowSdk,
  // Contract functions can be imported directly
  // when using umbrella SDK - adapter is already configured
} from '@cowprotocol/cow-sdk'
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
})

// Access contracts through the SDK
const settlementContract = sdk.contracts.settlement()
const vaultRelayerContract = sdk.contracts.vaultRelayer()
```

## Available Contracts

- **Settlement Contract** - Main CoW Protocol settlement contract
- **Vault Relayer** - Contract for handling vault interactions
- **Composable CoW** - Contract for conditional orders
- **Extensible Fallback Handler** - Safe fallback handler for smart contract wallets

> **Note:** This package is primarily designed to provide contract interfaces and is rarely used standalone. Most developers should use `@cowprotocol/cow-sdk` package which includes all contract utilities with proper adapter configuration.
