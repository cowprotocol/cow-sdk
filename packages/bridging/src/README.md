# BridgingSdk Integration Guide

🚀 **Unlock Seamless Cross-Chain Power!**
The **`BridgingSDK`** lets you 🌉 *swap tokens across chains* and bridge assets effortlessly — combining **CoW Protocol’s** 🐮 top-tier trading with multiple bridge providers for maximum flexibility.

📚 This **all-in-one guide** walks you through **everything** you need to integrate `BridgingSDK` into your app and supercharge your cross-chain experience! ✨

> See [PROVIDER_README](./PROVIDER_README.md) for a guide how to create a bridge provider for `BridgingSDK`

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [Configuration](#configuration)
5. [Core Methods](#core-methods)
6. [Examples](#examples)
   - [React App](#react-app)
   - [Node.js App](#nodejs-app)
7. [Types and Interfaces](#types-and-interfaces)
8. [Error Handling](#error-handling)
9. [Order Monitoring](#order-monitoring)
10. [Token Validation](#token-validation)
11. [Network Validation](#network-validation)
12. [Complete Type Reference](#complete-type-reference)

## Overview

The BridgingSdk supports two types of operations:
- **Single-chain swaps**: Traditional token swaps within the same blockchain. Basically, it's wrapper on top of [TradingSDK](../trading/README.md)
- **Cross-chain swaps**: Token swaps that span multiple blockchains using bridge providers. The main functionality of `BridgingSDK`

Supported bridge providers:
- **Bungee/Socket**: Multi-bridge aggregation platform with support for multiple underlying bridges including Across, CCTP, and others

> Since `BridgingSdk` is compatible with [TradingSDK](../trading/README.md), almost everything described for `TradingSDK` applies to `BridgingSdk` as well.
> The main difference is smart contract wallet support. Currently, `BridgingSdk` only supports EOA wallets; this will likely change soon — stay tuned!
## Installation

```bash
yarn add @cowprotocol/cow-sdk
```

## Quick Start

### Basic Setup

```typescript
import { BridgingSdk, BungeeBridgeProvider, SupportedChainId } from '@cowprotocol/cow-sdk'

const rpcUrls: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: 'https://eth-mainnet.alchemyapi.io/v2/YOUR_KEY',
  [SupportedChainId.POLYGON]: 'https://polygon-mainnet.alchemyapi.io/v2/YOUR_KEY',
  [SupportedChainId.ARBITRUM_ONE]: 'https://arb-mainnet.alchemyapi.io/v2/YOUR_KEY',
  [SupportedChainId.OPTIMISM]: 'https://opt-mainnet.alchemyapi.io/v2/YOUR_KEY',
  [SupportedChainId.BASE]: 'https://base-mainnet.alchemyapi.io/v2/YOUR_KEY',
  [SupportedChainId.AVALANCHE]: 'https://avalanche-mainnet.alchemyapi.io/v2/YOUR_KEY',
  // ... add other chain RPC URLs as needed
}

// Initialize the bridge provider
const bungeeProvider = new BungeeBridgeProvider({
  apiOptions: {
    includeBridges: ['across', 'cctp'], // Optional: specify which bridges to include
  },
})

// Create the BridgingSdk instance
const bridgingSdk = new BridgingSdk({
  providers: [bungeeProvider],
  enableLogging: true, // Optional: enable debug logging
})
```

### Basic Cross-Chain Swap

```typescript
import { OrderKind } from '@cowprotocol/contracts'
import {
  AccountAddress,
  BridgingSdk,
  SupportedChainId,
  QuoteBridgeRequest,
  isBridgeQuoteAndPost,
} from '@cowprotocol/cow-sdk'
import { parseEther } from '@ethersproject/units'
import { Wallet } from '@ethersproject/wallet'

async function performCrossChainSwap(wallet: Wallet, bridgingSdk: BridgingSdk): Promise<void> {
  const quoteBridgeRequest: QuoteBridgeRequest = {
    // Sell token (source chain)
    sellTokenChainId: SupportedChainId.MAINNET,
    sellTokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
    sellTokenDecimals: 18,

    // Buy token (destination chain)
    buyTokenChainId: SupportedChainId.POLYGON,
    buyTokenAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC on Polygon
    buyTokenDecimals: 6,

    // Trader parameters
    appCode: '<BRIDGING_APP_CODE>', // This value will be used to calculate volume of trade for your app
    account: wallet.address as AccountAddress, // Your wallet address
    signer: wallet, // ethers.js Wallet instance

    // Order details
    kind: OrderKind.SELL,
    amount: parseEther('1').toBigInt(), // 1 WETH
    receiver: '0x...', // Optional: recipient address on destination chain
  }

  try {
    // Get quote for cross-chain swap
    const quote = await bridgingSdk.getQuote(quoteBridgeRequest)

    // Check if it's a cross-chain quote
    if (isBridgeQuoteAndPost(quote)) {
      console.log('Cross-chain swap quote:', {
        bridgeProvider: quote.bridge.providerInfo.name,
        estimatedTime: quote.bridge.expectedFillTimeSeconds,
        bridgeFee: quote.bridge.fees.bridgeFee.toString(),
        destinationGasFee: quote.bridge.fees.destinationGasFee.toString(),
      })

      // Execute the swap
      const result = await quote.postSwapOrderFromQuote()
      console.log('Order placed:', result.orderId)
    } else {
      console.log('Single-chain swap detected')
      const result = await quote.postSwapOrderFromQuote()
      console.log('Order placed:', result.orderId)
    }
  } catch (error) {
    console.error('Cross-chain swap failed:', error)
  }
}
```

> `quote.postSwapOrderFromQuote()` function is compatible with the same function in [TradingSDK](../trading/README.md). Thanks to this you can easily migrate to `BridgingSDK`.

## Configuration

### [`BridgingSdkOptions`](./BridgingSdk/BridgingSdk.ts#L19)

```typescript
interface BridgingSdkOptions {
  /**
   * Bridge providers to use. Currently supports only one provider.
   */
  providers: BridgeProvider<BridgeQuoteResult>[]

  /**
   * Optional TradingSdk instance for single-chain swaps.
   * If not provided, a default instance will be created.
   */
  tradingSdk?: TradingSdk

  /**
   * Optional OrderBookApi instance.
   * If not provided, will use the one from tradingSdk or create a default.
   */
  orderBookApi?: OrderBookApi

  /**
   * Enable debug logging for the bridging SDK.
   */
  enableLogging?: boolean
}
```

**Type References:**
- [`BridgeProvider`](./types.ts#L155): Interface for bridge service providers
- [`BridgeQuoteResult`](./types.ts#L57): Result type for bridge quotes
- [`TradingSdk`](../trading/tradingSdk.ts#L89): SDK for trading operations
- [`OrderBookApi`](../order-book/api.ts#L159): API client for order book operations

### Advanced Configuration with Custom `TradingSDK`

```typescript
import {
  BridgingSdk,
  BungeeBridgeProvider,
  TradingSdk,
  OrderBookApi,
  SupportedChainId
} from '@cowprotocol/cow-sdk'

const orderBookApi: OrderBookApi = new OrderBookApi({
  env: 'prod', // or 'staging'
  chainId: SupportedChainId.MAINNET,
})

const tradingSdk: TradingSdk = new TradingSdk({
  chainId: SupportedChainId.MAINNET,
  env: 'prod',
}, {
  orderBookApi,
})

const bungeeProvider: BungeeBridgeProvider = new BungeeBridgeProvider({
  apiOptions: {
    includeBridges: ['across', 'cctp'],
  },
})

const bridgingSdk: BridgingSdk = new BridgingSdk({
  providers: [bungeeProvider],
  tradingSdk,
  orderBookApi,
  enableLogging: false,
})
```

## Core Methods

### getQuote()

Get a quote for either single-chain or cross-chain swaps.

```typescript
async function getQuote(
  quoteBridgeRequest: QuoteBridgeRequest,
  advancedSettings?: SwapAdvancedSettings
): Promise<CrossChainQuoteAndPost>
```

**Parameters:**
- `quoteBridgeRequest`: Swap parameters including tokens, amounts, and chains
- `advancedSettings`: Optional advanced settings for the swap

**Returns:**
- [`QuoteAndPost`](../trading/types.ts#L130): For single-chain swaps
- [`BridgeQuoteAndPost`](./types.ts#L286): For cross-chain swaps

### getSourceNetworks()

Get available source networks for bridging.

```typescript
const sourceNetworks = await bridgingSdk.getSourceNetworks()
console.log('Available source networks:', sourceNetworks.map(n => n.name))
```

### getTargetNetworks()

Get available target networks for bridging.

```typescript
const targetNetworks = await bridgingSdk.getTargetNetworks()
console.log('Available target networks:', targetNetworks.map(n => n.name))
```

### getBuyTokens()

Get available tokens for purchase on a specific target chain.

```typescript
const buyTokens = await bridgingSdk.getBuyTokens({
  buyChainId: SupportedChainId.POLYGON,
  sellChainId: SupportedChainId.MAINNET, // Optional filter
  sellTokenAddress: '0x...', // Optional filter
})
```

### getOrder()

Retrieve details of a previously placed cross-chain order.

```typescript
const order = await bridgingSdk.getOrder({
  chainId: SupportedChainId.MAINNET,
  orderId: '0x...',
  env: 'prod', // Optional
})

if (order) {
  console.log('Order status:', order.statusResult.status)
  console.log('Bridge provider:', order.provider.info.name)
}
```

### getOrderBridgingStatus()

Check the bridging status of a cross-chain order.

```typescript
const status = await bridgingSdk.getOrderBridgingStatus(
  'bridging-id',
  SupportedChainId.MAINNET
)

console.log('Bridging status:', status.status)
console.log('Fill time:', status.fillTimeInSeconds)
```

## Examples

### React App

```tsx
import React, { ReactNode, useState } from 'react'

import { OrderKind } from '@cowprotocol/contracts'
import {
  BridgingSdk,
  BungeeBridgeProvider,
  CrossChainQuoteAndPost,
  isBridgeQuoteAndPost,
  QuoteBridgeRequest,
  SupportedChainId,
} from '@cowprotocol/cow-sdk'
import { formatEther, parseEther } from '@ethersproject/units'
import { useWeb3React } from '@web3-react/core'

const getRpcUrl = (chainId: SupportedChainId): string => {
  // Add your RPC URLs here
  const rpcUrls: Record<SupportedChainId, string> = {
    [SupportedChainId.MAINNET]: 'https://eth-mainnet.alchemyapi.io/v2/YOUR_KEY',
    [SupportedChainId.POLYGON]: 'https://polygon-mainnet.alchemyapi.io/v2/YOUR_KEY',
    // ... other chains
  } as Record<SupportedChainId, string>
  return rpcUrls[chainId]
}

const bungeeProvider = new BungeeBridgeProvider({
  apiOptions: {
    includeBridges: ['across', 'cctp'], // Optional: specify which bridges to include
  },
})

const bridgingSdk = new BridgingSdk({ providers: [bungeeProvider] })

const appCode = 'COW_BRIDGING_REACT_EXAMPLE'

function CrossChainSwapComponent(): ReactNode {
  const { chainId, account, provider } = useWeb3React()
  const [quote, setQuote] = useState<CrossChainQuoteAndPost | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleGetQuote = async (): Promise<void> => {
    if (!account || !chainId || !provider) return

    setIsLoading(true)

    try {
      const signer = provider.getSigner()
      const quoteBridgeRequest: QuoteBridgeRequest = {
        appCode,
        sellTokenChainId: SupportedChainId.MAINNET,
        sellTokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
        sellTokenDecimals: 18,
        buyTokenChainId: SupportedChainId.POLYGON,
        buyTokenAddress: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', // WETH on Polygon
        buyTokenDecimals: 18,
        kind: OrderKind.SELL,
        amount: parseEther('1').toBigInt(),
        receiver: account,
        account: account as QuoteBridgeRequest['account'],
        signer,
      }

      const quoteResult = await bridgingSdk.getQuote(quoteBridgeRequest)
      setQuote(quoteResult)
    } catch (error) {
      console.error('Quote failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExecuteSwap = async (): Promise<void> => {
    if (!quote) return

    try {
      const result = await quote.postSwapOrderFromQuote()
      console.log('Swap executed:', result.orderId)
    } catch (error) {
      console.error('Swap execution failed:', error)
    }
  }

  return (
    <div>
      <button onClick={handleGetQuote} disabled={isLoading}>
        {isLoading ? 'Getting Quote...' : 'Get Quote'}
      </button>

      {quote && isBridgeQuoteAndPost(quote) && (
        <div>
          <h3>Cross-Chain Quote</h3>
          <p>Provider: {quote.bridge.providerInfo.name}</p>
          <p>Bridge Fee: {formatEther(quote.bridge.fees.bridgeFee)} WETH</p>
          <p>Estimated Time: {quote.bridge.expectedFillTimeSeconds}s</p>

          <button onClick={handleExecuteSwap}>Execute Swap</button>
        </div>
      )}
    </div>
  )
}
```

### Node.js App

```javascript
const {
  BridgingSdk,
  BungeeBridgeProvider,
  SupportedChainId,
  isBridgeQuoteAndPost
} = require('@cowprotocol/cow-sdk')
const { OrderKind } = require('@cowprotocol/contracts')
const { Wallet } = require('@ethersproject/wallet')
const { parseEther } = require('@ethersproject/units')

// Configure environment
require('dotenv').config()

const PRIVATE_KEY = process.env.PRIVATE_KEY
const INFURA_KEY = process.env.INFURA_KEY

async function main() {
  // Initialize wallet and provider
  const wallet = new Wallet(PRIVATE_KEY)
  const signer = wallet.connect(provider)

  // Initialize bridge provider
  const bungeeProvider = new BungeeBridgeProvider({
    apiOptions: {
      includeBridges: ['across', 'cctp'], // Optional: specify which bridges to include
    },
  })

  // Initialize BridgingSdk
  const bridgingSdk = new BridgingSdk({
    providers: [bungeeProvider],
    enableLogging: true,
  })

  // Prepare quote request
  const quoteBridgeRequest = {
    sellTokenChainId: SupportedChainId.MAINNET,
    sellTokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
    sellTokenDecimals: 18,
    buyTokenChainId: SupportedChainId.POLYGON,
    buyTokenAddress: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', // WETH on Polygon
    buyTokenDecimals: 18,
    kind: OrderKind.SELL,
    amount: parseEther('0.5').toBigInt(), // 0.5 WETH
    receiver: wallet.address,
    account: wallet.address,
    signer,
  }

  try {
    console.log('Getting quote...')
    const quote = await bridgingSdk.getQuote(quoteBridgeRequest)

    if (isBridgeQuoteAndPost(quote)) {
      console.log('Cross-chain quote received:', {
        provider: quote.bridge.providerInfo.name,
        bridgeFee: quote.bridge.fees.bridgeFee.toString(),
        estimatedTime: quote.bridge.expectedFillTimeSeconds,
      })

      console.log('Executing cross-chain swap...')
      const result = await quote.postSwapOrderFromQuote()
      console.log('Order placed successfully:', result.orderId)
    } else {
      console.log('Single-chain swap quote received')
      const result = await quote.postSwapOrderFromQuote()
      console.log('Order placed successfully:', result.orderId)
    }
  } catch (error) {
    console.error('Error:', error.message)
  }
}

main().catch(console.error)
```

## Types and Interfaces

### [`QuoteBridgeRequest`](./types.ts#L45)

```typescript
interface QuoteBridgeRequest {
  // Source token details
  sellTokenChainId: SupportedChainId
  sellTokenAddress: string
  sellTokenDecimals: number

  // Destination token details
  buyTokenChainId: TargetChainId
  buyTokenAddress: string
  buyTokenDecimals: number

  // Trader info
  appCode: string // This value will be used to calculate volume of trade for your app
  account: string // Trader account address
  signer: Signer // ethers.js Signer instance

  // Order details
  kind: OrderKind.SELL // Should always be SELL, BUY orders are not supported yet
  amount: bigint // Amount to sell (in sell token atoms)
  receiver?: string // Recipient address (defaults to account)
}
```

> Since `BridgingSDK.getQuote()` is compatible with `TradingSDK`, it has the same [optional parameters](../trading/README.md#optional-parameters).

### [`BridgeQuoteResult`](./types.ts#L57)

```typescript
interface BridgeQuoteResult {
  isSell: boolean // Might be false only for regular orders. For bridging order must always be true
  amountsAndCosts: BridgeQuoteAmountsAndCosts // Contains a breakdown of all all amounts and costs
  expectedFillTimeSeconds?: number
  quoteTimestamp: number

  fees: {
    bridgeFee: bigint // Fee for bridge provider
    destinationGasFee: bigint // Gas fee for destination execution
  }

  limits: {
    minDeposit: bigint // Minimum bridgeable amount
    maxDeposit: bigint // Maximum bridgeable amount
  }
}
```

### [`BridgeStatus`](./types.ts#L110)

```typescript
enum BridgeStatus {
  IN_PROGRESS = 'in_progress', // Bridge transaction is pending
  EXECUTED = 'executed',       // Successfully completed
  EXPIRED = 'expired',         // Transaction expired
  REFUND = 'refund',          // Funds were refunded
  UNKNOWN = 'unknown'         // Status could not be determined
}
```

## Error Handling

### Common Error Types

```typescript
import {
  BridgeProviderQuoteError,
  BridgeQuoteErrors
} from '@cowprotocol/cow-sdk'

try {
  const quote = await bridgingSdk.getQuote(...)

} catch (error) {
  if (error instanceof BridgeProviderQuoteError) {
    const errorMessage = error.message as BridgeQuoteErrors

    switch (errorMessage) {
      case BridgeQuoteErrors.ONLY_SELL_ORDER_SUPPORTED:
        console.error('Only sell orders are supported for bridging')
        break
      case BridgeQuoteErrors.TX_BUILD_ERROR:
        console.error('Failed to build bridge transaction')
        break
      default:
        console.error('Bridge provider error:', error.message)
    }
  } else {
    console.error('Unexpected error:', error)
  }
}
```

**Type References:**
- [`BridgeProviderQuoteError`](./errors.ts#L18): Error class for bridge provider failures
- [`BridgeQuoteErrors`](./errors.ts#L5): Enum of possible bridge quote error types

## Order Monitoring

```typescript
import { BridgingSdk, SupportedChainId, BridgeStatus } from '@cowprotocol/cow-sdk'

async function monitorOrder(
  bridgingSdk: BridgingSdk,
  chainId: SupportedChainId,
  orderId: string
): Promise<void> {
  const checkInterval = 30000 // 30 seconds

  const monitor = setInterval(async () => {
    try {
      const order = await bridgingSdk.getOrder({ chainId, orderId })

      if (order) {
        console.log('Order status:', order.statusResult.status)

        if (order.statusResult.status === BridgeStatus.EXECUTED) {
          console.log('Order completed successfully!')
          clearInterval(monitor)
        } else if (order.statusResult.status === BridgeStatus.EXPIRED) {
          console.log('Order expired')
          clearInterval(monitor)
        }
      }
    } catch (error) {
      console.error('Error monitoring order:', error)
    }
  }, checkInterval)
}
```

## Token Validation

```typescript
import { BridgingSdk, SupportedChainId, TargetChainId } from '@cowprotocol/cow-sdk'

async function validateTokenSupport(
  bridgingSdk: BridgingSdk,
  sellChainId: SupportedChainId,
  buyChainId: TargetChainId,
  buyTokenAddress: string
): Promise<void> {
  const buyTokens = await bridgingSdk.getBuyTokens({
    buyChainId,
    sellChainId,
  })

  const isSupported = buyTokens.some(
    token => token.address.toLowerCase() === buyTokenAddress.toLowerCase()
  )

  if (!isSupported) {
    throw new Error('Token not supported for bridging')
  }
}
```

## Network Validation

```typescript
import { BridgingSdk } from '@cowprotocol/cow-sdk'

async function validateNetworkSupport(bridgingSdk: BridgingSdk): Promise<void> {
  const sourceNetworks = await bridgingSdk.getSourceNetworks()
  const targetNetworks = await bridgingSdk.getTargetNetworks()

  console.log('Supported source networks:', sourceNetworks.map(n => n.name))
  console.log('Supported target networks:', targetNetworks.map(n => n.name))
}
```

## Complete Type Reference

This section provides links to all important TypeScript types and interfaces used throughout this documentation:

### Core SDK Types
- [`BridgingSdk`](./BridgingSdk/BridgingSdk.ts#L65): Main SDK class
- [`BridgingSdkOptions`](./BridgingSdk/BridgingSdk.ts#L19): SDK configuration options
- [`BungeeBridgeProvider`](./providers/bungee/BungeeBridgeProvider.ts#L58): Bungee bridge provider implementation

### Request and Response Types
- [`QuoteBridgeRequest`](./types.ts#L45): Parameters for requesting a bridge quote
- [`BridgeQuoteResult`](./types.ts#L57): Result of a bridge quote request
- [`BridgeQuoteAndPost`](./types.ts#L286): Cross-chain quote with posting functionality
- [`CrossChainQuoteAndPost`](./types.ts#L284): Union type for single or cross-chain quotes

### Trading Integration Types
- [`QuoteAndPost`](../trading/types.ts#L130): Single-chain trading quote and post functionality
- [`TradingSdk`](../trading/tradingSdk.ts#L89): Trading SDK for single-chain operations
- [`OrderBookApi`](../order-book/api.ts#L159): Order book API client

### Chain and Token Types
- [`SupportedChainId`](../chains/types.ts#L4): Supported blockchain network identifiers
- [`TargetChainId`](../chains/types.ts#L16): Target blockchain network identifiers
- [`TokenInfo`](../common/types/tokens.ts#L15): Token information structure
- [`OrderKind`](../order-book/generated/models/OrderKind.ts): Order type enumeration

### Status and Error Types
- [`BridgeStatus`](./types.ts#L110): Bridge operation status enumeration
- [`BridgeStatusResult`](./types.ts#L118): Bridge status query result
- [`BridgeProviderQuoteError`](./errors.ts#L18): Bridge provider error class
- [`BridgeQuoteErrors`](./errors.ts#L5): Bridge quote error types

### Utility Types
- [`BridgeProvider`](./types.ts#L155): Generic bridge provider interface
- [`BridgeQuoteAmountsAndCosts`](./types.ts#L321): Cost breakdown for bridge operations
- [`BridgeHook`](./types.ts#L105): Post-hook configuration for bridging
- [`isBridgeQuoteAndPost`](./utils.ts#L5): Type guard for cross-chain quotes
