# Bridge Provider Development Guide

This guide explains how to develop a new bridge provider for the `CoW Protocol` `BridgingSDK`.
Bridge providers integrate third-party bridging protocols into the `CoW ecosystem`, enabling cross-chain token swaps.

> You can see existing providers code in [`src/bridging/providers`](./providers) directory.

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [BridgeProvider Interface](#bridgeprovider-interface)
4. [Implementation Guide](#implementation-guide)
5. [Testing Your Provider](#testing-your-provider)
6. [Best Practices](#best-practices)
7. [Integration Examples](#integration-examples)
8. [Troubleshooting](#troubleshooting)

## Overview

A bridge provider acts as an adapter between the BridgingSdk and external bridging protocols. It handles:

- **Quote Generation**: Fetching bridging quotes from external APIs
- **Transaction Building**: Creating unsigned bridge transactions
- **Hook Management**: Generating pre-authorized hooks for CoW settlement
- **Status Tracking**: Monitoring bridge transaction status
- **Token Support**: Managing supported tokens across chains

### Key Concepts

- **Intermediate Tokens**: Tokens on the source chain that can be bridged to the destination chain
- **CoW Shed**: Proxy contracts that hold user funds during bridging
- **Post Hooks**: Smart contract calls executed after order settlement to initiate bridging
- **Bridge Quotes**: Price and timing estimates for cross-chain transfers

## Getting Started

### 1. Create Provider Structure

```
src/bridging/providers/your-bridge/
├── YourBridgeProvider.ts      # Main provider class
├── YourBridgeApi.ts          # API client
├── types.ts                  # Type definitions
├── util.ts                   # Utility functions
├── createYourBridgeCall.ts   # Transaction builder
└── const/
    ├── contracts.ts          # Contract addresses
    └── misc.ts              # Constants
```

### 2. Define Provider Options

```typescript
import { SupportedChainId, CowShedSdkOptions } from '../../../chains'

export interface YourBridgeProviderOptions {
  // API configuration
  apiOptions?: YourBridgeApiOptions

  // CoW Shed configuration
  cowShedOptions?: CowShedSdkOptions
}

export interface YourBridgeApiOptions {
  baseUrl?: string
  apiKey?: string
  // Add provider-specific options
}
```

## BridgeProvider Interface

The [`BridgeProvider<Q extends BridgeQuoteResult>`](types.ts#L155) interface defines all methods your provider must implement:

### Core Properties

```typescript
interface BridgeProvider<Q extends BridgeQuoteResult> {
  // Provider metadata
  info: BridgeProviderInfo
}
```

### Required Methods

| Method                           | Purpose                               | Required   |
| -------------------------------- | ------------------------------------- | ---------- |
| `getNetworks()`                  | Get supported destination chains      | ✅         |
| `getBuyTokens()`                 | Get supported tokens for a chain      | ✅         |
| `getIntermediateTokens()`        | Get bridgeable tokens on source chain | ✅         |
| `getQuote()`                     | Generate bridge quote                 | ✅         |
| `getUnsignedBridgeCall()`        | Create unsigned bridge transaction    | ✅         |
| `getGasLimitEstimationForHook()` | Estimate gas for hook execution       | ✅         |
| `getSignedHook()`                | Generate pre-authorized hook          | ✅         |
| `getStatus()`                    | Check bridge transaction status       | ✅         |
| `getBridgingParams()`            | Extract bridge params from settlement | ✅         |
| `getExplorerUrl()`               | Get bridge explorer URL               | ✅         |
| `decodeBridgeHook()`             | Decode hook data                      | Optional\* |
| `getCancelBridgingTx()`          | Create cancel transaction             | Optional\* |
| `getRefundBridgingTx()`          | Create refund transaction             | Optional\* |

\*Can throw "Not implemented" error if unsupported

## Implementation Guide

### Step 1: Basic Provider Class

```typescript
import { BridgeProvider, BridgeProviderInfo, BridgeQuoteResult } from '../../types'
import { SupportedChainId, mainnet, polygon, arbitrumOne, optimism, ChainInfo } from '../../../chains'
import { CowShedSdk } from '../../../cow-shed'
import { HOOK_DAPP_BRIDGE_PROVIDER_PREFIX } from '../../const'

export const YOUR_BRIDGE_HOOK_DAPP_ID = `${HOOK_DAPP_BRIDGE_PROVIDER_PREFIX}/your-bridge`

// Define supported networks
export const YOUR_BRIDGE_SUPPORTED_NETWORKS = [
  mainnet,
  polygon,
  arbitrumOne,
  optimism,
  // Add your supported chains
  // If there are no needed chains, add them to `src/chains`
]

export interface YourBridgeQuoteResult extends BridgeQuoteResult {
  // Add provider-specific quote data
  externalQuote: YourBridgeQuote
  metadata: YourBridgeMetadata
}

export class YourBridgeProvider implements BridgeProvider<YourBridgeQuoteResult> {
  protected api: YourBridgeApi
  protected cowShedSdk: CowShedSdk

  constructor(private options: YourBridgeProviderOptions) {
    this.api = new YourBridgeApi(options.apiOptions)
    this.cowShedSdk = new CowShedSdk(options.cowShedOptions)
  }

  info: BridgeProviderInfo = {
    name: 'YourBridge',
    logoUrl: `/your-bridge/logo.png`,
    dappId: YOUR_BRIDGE_HOOK_DAPP_ID,
    website: 'https://yourbridge.example',
  }

  // Implement all required methods...
}
```

> It's important to define valid `info.dappId`. It should always start with `HOOK_DAPP_BRIDGE_PROVIDER_PREFIX`

### Step 2: Network and Token Support

```typescript
export class YourBridgeProvider implements BridgeProvider<YourBridgeQuoteResult> {
  async getNetworks(): Promise<ChainInfo[]> {
    // Return chains supported as destination
    return YOUR_BRIDGE_SUPPORTED_NETWORKS
  }

  async getBuyTokens(params: BuyTokensParams): Promise<GetProviderBuyTokens> {
    // Get tokens available for purchase on target chain
    try {
      const tokensFromApi = await this.api.getSupportedTokens({
        chainId: params.buyChainId,
        sellChainId: params.sellChainId,
        sellTokenAddress: params.sellTokenAddress,
      })

      const tokens = tokensFromApi.map((token) => ({
        chainId: token.chainId,
        address: token.address,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        logoUrl: token.logoUrl,
      }))
      const isRouteAvailable = tokens.length > 0

      return { tokens, isRouteAvailable }
    } catch (error) {
      console.error('Failed to fetch buy tokens:', error)
      return []
    }
  }

  async getIntermediateTokens(request: QuoteBridgeRequest): Promise<TokenInfo[]> {
    // Validate order kind
    if (request.kind !== OrderKind.SELL) {
      throw new BridgeProviderQuoteError(BridgeQuoteErrors.ONLY_SELL_ORDER_SUPPORTED, { kind: request.kind })
    }

    // Get tokens on source chain that can bridge to target token
    const { sellTokenChainId, buyTokenChainId, buyTokenAddress } = request

    const intermediateTokens = await this.api.getIntermediateTokens({
      fromChainId: sellTokenChainId,
      toChainId: buyTokenChainId,
      toTokenAddress: buyTokenAddress,
    })

    // Return sorted by liquidity/priority
    return intermediateTokens
  }
}
```

### Step 3: Quote Generation

```typescript
export class YourBridgeProvider implements BridgeProvider<YourBridgeQuoteResult> {
  async getQuote(request: QuoteBridgeRequest): Promise<YourBridgeQuoteResult> {
    const {
      sellTokenAddress, // This is the intermediate token
      sellTokenChainId,
      buyTokenChainId,
      buyTokenAddress,
      amount,
      receiver,
      account,
      owner,
    } = request

    // Get CoW Shed account for the owner
    const ownerAddress = owner ?? account
    const cowShedAccount = this.cowShedSdk.getCowShedAccount(sellTokenChainId, ownerAddress)

    // Request quote from external bridge
    const externalQuote = await this.api.getQuote({
      fromChainId: sellTokenChainId,
      toChainId: buyTokenChainId,
      fromTokenAddress: sellTokenAddress,
      toTokenAddress: buyTokenAddress,
      amount: amount.toString(),
      fromAddress: cowShedAccount,
      toAddress: receiver ?? account,
    })

    // Validate quote
    await this.validateQuote(externalQuote, request)

    // Convert to standard BridgeQuoteResult format
    return this.convertToBridgeQuote(externalQuote, request)
  }

  private async validateQuote(externalQuote: YourBridgeQuote, request: QuoteBridgeRequest): Promise<void> {
    // Add validation logic
    if (!externalQuote.isValid) {
      throw new BridgeProviderQuoteError(BridgeQuoteErrors.NO_ROUTES, { quote: externalQuote })
    }
  }

  private convertToBridgeQuote(externalQuote: YourBridgeQuote, request: QuoteBridgeRequest): YourBridgeQuoteResult {
    return {
      isSell: true,
      amountsAndCosts: {
        costs: {
          bridgingFee: {
            feeBps: externalQuote.feeBps,
            amountInSellCurrency: BigInt(externalQuote.bridgeFee),
            amountInBuyCurrency: BigInt(externalQuote.bridgeFeeInBuyToken),
          },
        },
        beforeFee: {
          sellAmount: BigInt(request.amount),
          buyAmount: BigInt(externalQuote.outputAmount),
        },
        afterFee: {
          sellAmount: BigInt(request.amount),
          buyAmount: BigInt(externalQuote.outputAmountAfterFee),
        },
        afterSlippage: {
          sellAmount: BigInt(request.amount),
          buyAmount: BigInt(externalQuote.minOutputAmount),
        },
        slippageBps: externalQuote.slippageBps,
      },
      quoteTimestamp: Date.now(),
      expectedFillTimeSeconds: externalQuote.estimatedTime,
      fees: {
        bridgeFee: BigInt(externalQuote.bridgeFee),
        destinationGasFee: BigInt(externalQuote.destinationGasFee),
      },
      limits: {
        minDeposit: BigInt(externalQuote.minAmount),
        maxDeposit: BigInt(externalQuote.maxAmount),
      },
      // Provider-specific data
      externalQuote,
    }
  }
}
```

### Step 4: Transaction Building

> It very depends on your smart-contract implementation.
> Basically, the smart-contract should:
>
> 1. Approve sell token spending from `CoW Shed proxy`
> 2. Transfer funds from `CoW Shed proxy` to your deposit smart-contract
>
> See `createBungeeDepositCall` as an example

```typescript
export class YourBridgeProvider implements BridgeProvider<YourBridgeQuoteResult> {
  async getUnsignedBridgeCall(request: QuoteBridgeRequest, quote: YourBridgeQuoteResult): Promise<EvmCall> {
    // Create the bridge transaction that will be executed by CoW Shed
    return createYourBridgeCall({
      request,
      quote,
      cowShedSdk: this.cowShedSdk,
    })
  }
}

// In createYourBridgeCall.ts
import { ethers } from 'ethers'
import { QuoteBridgeRequest } from '../../types'
import { EvmCall } from '../../../common'

import { YourBridgeQuoteResult } from '../types'
import { YOUR_BRIDGE_CONTRACTS, YOUR_BRIDGE_ABI } from '../const'

export async function createYourBridgeCall({
  request,
  quote,
}: {
  request: QuoteBridgeRequest
  quote: YourBridgeQuoteResult
}): Promise<EvmCall> {
  const { sellTokenChainId, sellTokenAddress, amount, owner, account } = request
  const { externalQuote } = quote

  // Get bridge contract address
  const bridgeContract = YOUR_BRIDGE_CONTRACTS[sellTokenChainId]
  if (!bridgeContract) {
    throw new Error(`Bridge contract not found for chain ${sellTokenChainId}`)
  }

  // Encode bridge function call
  const bridgeInterface = new ethers.utils.Interface(YOUR_BRIDGE_ABI)
  const callData = bridgeInterface.encodeFunctionData('bridge', [
    sellTokenAddress, // token to bridge
    amount, // amount to bridge
    externalQuote.toChainId, // destination chain
    externalQuote.toTokenAddress, // destination token
    externalQuote.minOutputAmount, // minimum output
    externalQuote.recipient, // recipient
    externalQuote.deadline, // deadline
    externalQuote.callData, // bridge-specific data
  ])

  return {
    to: bridgeContract,
    data: callData,
    value: BigInt(0), // or bridge fee if ETH
  }
}
```

### Step 5: Hook Management

```typescript
import { BridgeHook, BridgeProvider, QuoteBridgeRequest } from '../../types'
import { SupportedChainId } from '../../../chains'
import { EvmCall } from '../../../common'
import { Signer } from 'ethers'
import { getGasLimitEstimationForHook } from '../utils/getGasLimitEstimationForHook'

export class YourBridgeProvider implements BridgeProvider<YourBridgeQuoteResult> {
  async getGasLimitEstimationForHook(request: Omit<QuoteBridgeRequest, 'amount'> & { extraGas?: number; extraGasProxyCreation?: number  }): Promise<number> {
    // Use utility function or implement custom gas estimation
    return getGasLimitEstimationForHook({
      cowshed: this.cowShedSdk,
      request: request as QuoteBridgeRequest, // cast needed due to omit
      extraGas: request.extraGas, // to add extra gas to the hook
      extraGasProxyCreation: request.extraGasProxyCreation // to add extra gas to the hook and deploy proxy account
    })
  }

  async getSignedHook(
    chainId: SupportedChainId,
    unsignedCall: EvmCall,
    signer: Signer,
    bridgeHookNonce: string,
    deadline: bigint,
    hookGasLimit: number,
  ): Promise<BridgeHook> {
    // Sign the multicall using CoW Shed SDK
    const { signedMulticall, cowShedAccount, gasLimit } = await this.cowShedSdk.signCalls({
      calls: [
        {
          target: unsignedCall.to,
          value: unsignedCall.value,
          callData: unsignedCall.data,
          allowFailure: false,
          isDelegateCall: true,
        },
      ],
      chainId,
      signer,
      gasLimit: BigInt(hookGasLimit),
      deadline,
      nonce: bridgeHookNonce,
    })

    const { to, data } = signedMulticall
    return {
      postHook: {
        target: to,
        callData: data,
        gasLimit: gasLimit.toString(),
        dappId: YOUR_BRIDGE_HOOK_DAPP_ID,
      },
      recipient: cowShedAccount,
    }
  }
}
```

> Note: getGasLimitEstimationForHook() implies a post-hook estimation. But it might be not trivial, because it's assumed that hook will be called with a context of CoW Shed after swap execution. It means that we expect funds are already transfered to CoW Shed after swap. But in fact there are no funds on CoW Shed on the moment of an order creation.

### Step 6: Status Tracking

```typescript
import { ChainId, SupportedChainId } from '../../../chains'
import { BridgeProvider, BridgeStatus, BridgeStatusResult, BridgingDepositParams } from '../../types'

export class YourBridgeProvider implements BridgeProvider<YourBridgeQuoteResult> {
  async getStatus(bridgingId: string, originChainId: SupportedChainId): Promise<BridgeStatusResult> {
    try {
      const status = await this.api.getBridgeStatus({
        transactionId: bridgingId,
        originChainId,
      })

      return {
        status: this.mapStatusToBridgeStatus(status.status),
        fillTimeInSeconds: status.fillTime,
        depositTxHash: status.depositTxHash,
        fillTxHash: status.fillTxHash,
      }
    } catch (error) {
      console.error('Failed to get bridge status:', error)
      return {
        status: BridgeStatus.UNKNOWN,
      }
    }
  }

  private mapStatusToBridgeStatus(externalStatus: string): BridgeStatus {
    // This an example code, do not use swich/case in such cases
    // It's better to use Record<string, BridgeStatus> instead
    switch (externalStatus.toLowerCase()) {
      case 'pending':
      case 'processing':
        return BridgeStatus.IN_PROGRESS
      case 'completed':
      case 'filled':
        return BridgeStatus.EXECUTED
      case 'expired':
      case 'timeout':
        return BridgeStatus.EXPIRED
      case 'refunded':
      case 'cancelled':
        return BridgeStatus.REFUND
      default:
        return BridgeStatus.UNKNOWN
    }
  }

  async getBridgingParams(
    chainId: ChainId,
    orderUid: string,
    txHash: string,
  ): Promise<{ params: BridgingDepositParams; status: BridgeStatusResult } | null> {
    try {
      // Get transaction receipt
      const adapter = getGlobalAdapter()

      const txReceipt = await adapter.getTransactionReceipt(txHash)

      // Parse bridge events from transaction logs
      const bridgeParams = await this.extractBridgeParams(orderUid, txReceipt)

      if (!bridgeParams) return null

      return {
        params: bridgeParams,
        status: await this.getStatus(bridgeParams.bridgingId, chainId),
      }
    } catch (error) {
      console.error('Failed to get bridging params:', error)
      return null
    }
  }

  getExplorerUrl(bridgingId: string): string {
    return `https://yourbridge.example/tx/${bridgingId}`
  }
}
```

### Type Definitions

Define comprehensive types for your provider:

```typescript
// types.ts
export interface YourBridgeQuoteRequest {
  fromChainId: number
  toChainId: number
  fromTokenAddress: string
  toTokenAddress: string
  amount: string
  fromAddress: string
  toAddress: string
}

export interface YourBridgeQuote {
  isValid: boolean
  outputAmount: string
  outputAmountAfterFee: string
  minOutputAmount: string
  bridgeFee: string
  bridgeFeeInBuyToken: string
  destinationGasFee: string
  feeBps: number
  slippageBps: number
  estimatedTime: number
  minAmount: string
  maxAmount: string
  deadline: number
  callData: string
  // Add provider-specific fields
}

export interface YourBridgeStatusRequest {
  transactionId: string
  originChainId: SupportedChainId
}

export interface YourBridgeStatus {
  status: string
  fillTime?: number
  depositTxHash?: string
  fillTxHash?: string
}
```

### Constants

Define contract addresses and other constants:

```typescript
// const/contracts.ts
export const YOUR_BRIDGE_CONTRACTS: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: '0x...',
  [SupportedChainId.POLYGON]: '0x...',
  [SupportedChainId.ARBITRUM_ONE]: '0x...',
  [SupportedChainId.OPTIMISM]: '0x...',
}

// const/misc.ts
export const HOOK_DAPP_BRIDGE_PROVIDER_PREFIX = 'cow-hooks.cow.fi'
export const YOUR_BRIDGE_SUPPORTED_TOKENS = {
  // Define supported token lists
}
```

## Testing Your Provider

### Unit Tests

```typescript
// YourBridgeProvider.test.ts
import { YourBridgeProvider } from '../YourBridgeProvider'
import { MockBridgeProvider } from '../../mock/MockBridgeProvider'
import { SupportedChainId } from '../../../../chains'

describe('YourBridgeProvider', () => {
  let provider: YourBridgeProvider

  beforeEach(() => {
    provider = new YourBridgeProvider({
      apiOptions: {
        baseUrl: 'https://test-api.yourbridge.example',
      },
    })
  })

  describe('getNetworks', () => {
    it('should return supported networks', async () => {
      const networks = await provider.getNetworks()
      expect(networks).toHaveLength(4)
      expect(networks[0].name).toBe('Ethereum')
    })
  })

  describe('getQuote', () => {
    it('should return valid quote', async () => {
      const request = {
        sellTokenChainId: SupportedChainId.MAINNET,
        sellTokenAddress: '0x...',
        // ... complete request
      }

      const quote = await provider.getQuote(request)

      expect(quote.isSell).toBe(true)
      expect(quote.fees.bridgeFee).toBeGreaterThan(0n)
    })

    it('should throw error for BUY orders', async () => {
      const request = {
        kind: OrderKind.BUY,
        // ... rest of request
      }

      await expect(provider.getQuote(request)).rejects.toThrow('Only sell orders are supported')
    })
  })

  // Add more tests...
})
```

## Best Practices

### Error Handling

```typescript
// Use specific error types
throw new BridgeProviderQuoteError(BridgeQuoteErrors.INSUFFICIENT_LIQUIDITY, {
  availableLiquidity: '1000',
  requestedAmount: '2000',
})

// Handle API failures gracefully
try {
  return await this.api.getQuote(params)
} catch (error) {
  if (error.status === 404) {
    throw new BridgeProviderQuoteError(BridgeQuoteErrors.NO_ROUTES_FOUND, { params })
  }
  throw error
}
```

### Logging

```typescript
import { log } from '../../../common/utils/log'

async getQuote(request: QuoteBridgeRequest): Promise<YourBridgeQuoteResult> {
  log('Getting quote for YourBridge:', {
    fromChain: request.sellTokenChainId,
    toChain: request.buyTokenChainId,
    amount: request.amount.toString(),
  })

  // ... implementation
}
```

### Validation

```typescript
private validateRequest(request: QuoteBridgeRequest): void {
  if (request.amount <= 0n) {
    throw new BridgeProviderQuoteError(
      BridgeQuoteErrors.INVALID_AMOUNT,
      { amount: request.amount.toString() }
    )
  }

  if (!YOUR_BRIDGE_SUPPORTED_NETWORKS.some(n => n.chainId === request.buyTokenChainId)) {
    throw new BridgeProviderQuoteError(
      BridgeQuoteErrors.UNSUPPORTED_CHAIN,
      { chainId: request.buyTokenChainId }
    )
  }
}
```

### Performance

```typescript
// Cache frequently accessed data
private tokenCache = new Map<string, TokenInfo[]>()

async getBuyTokens(params: BuyTokensParams): Promise<GetProviderBuyTokens> {
  const cacheKey = `${params.buyChainId}-${params.sellChainId}`

  if (this.tokenCache.has(cacheKey)) {
    return this.tokenCache.get(cacheKey)!
  }

  const tokens = await this.api.getSupportedTokens(params)
  this.tokenCache.set(cacheKey, tokens)
  const isRouteAvailable = tokens.length > 0

  return { tokens, isRouteAvailable }
}
```

## Integration Examples

### Adding Your Provider to BridgingSdk

```typescript
// Example usage
import { BridgingSdk, YourBridgeProvider } from '@cowprotocol/cow-sdk'

const yourBridgeProvider = new YourBridgeProvider({
  apiOptions: {
    apiKey: process.env.YOUR_BRIDGE_API_KEY,
    baseUrl: 'https://api.yourbridge.example',
  },
})

const bridgingSdk = new BridgingSdk({
  providers: [yourBridgeProvider],
  enableLogging: true,
})
```

## Troubleshooting

### Common Issues

1. **Gas Estimation Failures**

   ```typescript
   import { getGasLimitEstimationForHook } from '../utils/getGasLimitEstimationForHook'

   // Provide fallback gas limits
   async getGasLimitEstimationForHook(): Promise<number> {
     try {
       return await getGasLimitEstimationForHook(...)
     } catch (error) {
       console.warn('Gas estimation failed, using fallback:', error)
       return 800_000 // Safe fallback
     }
   }
   ```

2. **API Rate Limiting**

   ```typescript
   // Implement retry logic with exponential backoff
   private async withRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
     for (let attempt = 1; attempt <= maxRetries; attempt++) {
       try {
         return await operation()
       } catch (error) {
         if (attempt === maxRetries || !this.isRetryableError(error)) {
           throw error
         }

         const delay = Math.pow(2, attempt - 1) * 1000
         await new Promise(resolve => setTimeout(resolve, delay))
       }
     }
     throw new Error('Max retries exceeded')
   }
   ```

3. **Token Address Mismatches**
   ```typescript
   // Normalize addresses consistently
   private normalizeAddress(address: string): string {
     return address.toLowerCase()
   }
   ```

### Debug Tips

- Enable detailed logging during development
- Test with small amounts first
- Validate against existing providers like `MockBridgeProvider`
- Monitor transaction status on both chains
