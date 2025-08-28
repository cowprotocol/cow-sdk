<p align="center">
  <img width="400" src="https://github.com/cowprotocol/cow-sdk/raw/main/docs/images/CoW.png" />
</p>

# SDK Config

This package contains configuration constants, chain definitions, and settings for the CoW Protocol SDK. It provides essential configuration utilities and types that are used across all SDK packages.

## What's included

- **Supported Chains** - Definitions for all blockchains supported by CoW Protocol
- **Environment Configuration** - Production and staging environment settings
- **Contract Addresses** - Smart contract addresses for each supported chain
- **API Configuration** - Base URLs and configuration options for CoW Protocol APIs
- **Chain Information** - Detailed chain metadata, native currencies, and RPC endpoints

## Installation

```bash
pnpm add @cowprotocol/sdk-config
```

## Usage

### Individual package usage

```typescript
import {
  SupportedChainId,
  ALL_SUPPORTED_CHAINS_MAP,
  CowEnv,
  ApiContext,
  ChainInfo,
  COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS,
} from '@cowprotocol/sdk-config'

// Use supported chain IDs
const chainId = SupportedChainId.MAINNET // 1
const gnosisChain = SupportedChainId.GNOSIS_CHAIN // 100

// Get chain information
const mainnetInfo: ChainInfo = ALL_SUPPORTED_CHAINS_MAP[SupportedChainId.MAINNET]
console.log(mainnetInfo.label) // "Ethereum"
console.log(mainnetInfo.nativeCurrency.symbol) // "ETH"

// Get contract addresses
const settlementAddress = COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[SupportedChainId.MAINNET]

// Configure API context
const apiContext: ApiContext = {
  chainId: SupportedChainId.SEPOLIA,
  env: 'staging' as CowEnv,
}
```

### Usage with Umbrella SDK

```typescript
import { CowSdk, SupportedChainId, ALL_SUPPORTED_CHAINS_MAP, CowEnv, ApiContext, ChainInfo } from '@cowprotocol/cow-sdk'

const sdk = new CowSdk({
  chainId: SupportedChainId.MAINNET, // From config package
  adapter,
  env: 'prod', // From config package
})
```

> **Note:** This package is primarily designed to provide configuration constants and is rarely used standalone. Most developers should use the umbrella `@cowprotocol/cow-sdk` package or specific feature packages.
