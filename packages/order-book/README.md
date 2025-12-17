<p align="center">
  <img width="400" src="https://github.com/cowprotocol/cow-sdk/raw/main/docs/images/CoW.png" />
</p>

# SDK Order Book

This package provides a comprehensive API client for interacting with the CoW Protocol Order Book. It handles order submission, retrieval, cancellation, and trading data with built-in rate limiting, retries, and error handling.

## Installation

```bash
npm install @cowprotocol/sdk-order-book
or
pnpm add @cowprotocol/sdk-order-book
or
yarn add @cowprotocol/sdk-order-book
```

## Usage

```typescript
import { OrderBookApi, SupportedChainId, OrderQuoteRequest, OrderCreation } from '@cowprotocol/sdk-order-book'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import { EthersV6Adapter } from '@cowprotocol/sdk-ethers-v6-adapter'
import { JsonRpcProvider, Wallet } from 'ethers'

// Configure the adapter
const provider = new JsonRpcProvider('YOUR_RPC_URL')
const wallet = new Wallet('YOUR_PRIVATE_KEY', provider)
const adapter = new EthersV6Adapter({ provider, signer: wallet })
setGlobalAdapter(adapter)

// Initialize Order Book API
const orderBookApi = new OrderBookApi({
  chainId: SupportedChainId.MAINNET,
  env: 'prod', // or 'staging'
})

// Get a quote
const quoteRequest: OrderQuoteRequest = {
  sellToken: '0xA0b86a33E6417b528874E10EB3a95beb4F25A0E3', // GNO
  buyToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  from: await wallet.getAddress(),
  receiver: await wallet.getAddress(),
  sellAmountBeforeFee: '1000000000000000000', // 1 GNO
  kind: 'sell',
}

const { quote } = await orderBookApi.getQuote(quoteRequest)

// Submit an order (after signing)
const signedOrder: OrderCreation = {
  ...quote,
  signature: 'SIGNED_SIGNATURE',
  signingScheme: 'eip712',
  from: await wallet.getAddress(),
}

const orderId = await orderBookApi.sendOrder(signedOrder)

// Get order details
const order = await orderBookApi.getOrder(orderId)

// Get user's orders
const orders = await orderBookApi.getOrders({
  owner: await wallet.getAddress(),
  limit: 10,
  offset: 0,
})

// Get trades
const trades = await orderBookApi.getTrades({
  owner: await wallet.getAddress(),
})
```

### Usage with CoW SDK

```typescript
import { CowSdk, SupportedChainId, OrderQuoteRequest } from '@cowprotocol/cow-sdk'
import { EthersV6Adapter } from '@cowprotocol/sdk-ethers-v6-adapter'
import { JsonRpcProvider, Wallet } from 'ethers'

// Configure the adapter
const provider = new JsonRpcProvider('YOUR_RPC_URL')
const wallet = new Wallet('YOUR_PRIVATE_KEY', provider)
const adapter = new EthersV6Adapter({ provider, signer: wallet })

// Initialize the unified SDK
const sdk = new CowSdk({
  chainId: SupportedChainId.MAINNET,
  adapter,
})

const { quote } = await sdk.orderBook.getQuote(quoteRequest)
const orderId = await sdk.orderBook.sendOrder(signedOrder)
const order = await sdk.orderBook.getOrder(orderId)
const orders = await sdk.orderBook.getOrders({ owner: address })
```

## Configuration Options

### Environment Configuration

```typescript
const orderBookApi = new OrderBookApi({
  chainId: SupportedChainId.MAINNET,
  env: 'staging', // Use staging environment
})
```

### Custom API Endpoints

```typescript
const orderBookApi = new OrderBookApi({
  chainId: SupportedChainId.MAINNET,
  baseUrls: {
    [SupportedChainId.MAINNET]: 'https://your-custom-endpoint.com',
    [SupportedChainId.GNOSIS_CHAIN]: 'https://your-gnosis-endpoint.com',
  },
})
```

### Rate Limiting Configuration

```typescript
import { RateLimiterOpts } from 'limiter'
import { BackoffOptions } from 'exponential-backoff'

const limiterOpts: RateLimiterOpts = {
  tokensPerInterval: 5,
  interval: 'second',
}

const backOffOpts: BackoffOptions = {
  numOfAttempts: 5,
  maxDelay: Infinity,
  jitter: 'none',
}

const orderBookApi = new OrderBookApi({
  chainId: SupportedChainId.MAINNET,
  limiterOpts,
  backOffOpts,
})
```

> **Note:** This package provides direct access to the CoW Protocol Order Book API. For a higher-level trading interface that handles signing and order management automatically, consider using the Trading SDK alongside this package.
