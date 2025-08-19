<p align="center">
  <img width="400" src="https://github.com/cowprotocol/cow-sdk/raw/main/docs/images/CoW.png" />
</p>

# SDK Order Signing

This package provides EIP-712 order signing and cancellation utilities for the CoW Protocol. It handles all the cryptographic operations required to sign orders and cancellations according to CoW Protocol's specifications.

## Installation

```bash
npm install @cowprotocol/sdk-order-signing
or
pnpm add @cowprotocol/sdk-order-signing
or
yarn add @cowprotocol/sdk-order-signing
```

## Usage

### Individual package usage

```typescript
import { OrderSigningUtils, SupportedChainId, UnsignedOrder, SigningResult } from '@cowprotocol/sdk-order-signing'
import { EthersV6Adapter } from '@cowprotocol/sdk-ethers-v6-adapter'
import { JsonRpcProvider, Wallet } from 'ethers'

// Configure the adapter
const provider = new JsonRpcProvider('YOUR_RPC_URL')
const wallet = new Wallet('YOUR_PRIVATE_KEY', provider)
const adapter = new EthersV6Adapter({ provider, signer: wallet })

// Create order signing utils
const orderSigning = new OrderSigningUtils(adapter)

// Sign an order
const orderToSign: UnsignedOrder = {
  sellToken: '0xA0b86a33E6417b528874E10EB3a95beb4F25A0E3',
  buyToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  sellAmount: '1000000000000000000',
  buyAmount: '1000000000000000000',
  validTo: Math.floor(Date.now() / 1000) + 3600,
  appData: '0x0000000000000000000000000000000000000000000000000000000000000000',
  feeAmount: '0',
  kind: 'sell',
  partiallyFillable: false,
  sellTokenBalance: 'erc20',
  buyTokenBalance: 'erc20',
  receiver: '0x0000000000000000000000000000000000000000',
}

const signingResult: SigningResult = await OrderSigningUtils.signOrder(
  orderToSign,
  SupportedChainId.MAINNET,
  adapter.signer,
)

// Sign order cancellation
const orderId = 'ORDER_UID_TO_CANCEL'
const cancellationResult = await OrderSigningUtils.signOrderCancellation(
  orderId,
  SupportedChainId.MAINNET,
  adapter.signer,
)

// Generate order ID
const { orderId: generatedId, orderDigest } = await OrderSigningUtils.generateOrderId(
  SupportedChainId.MAINNET,
  orderToSign as any,
  { owner: await adapter.signer.getAddress() },
)
```

### Usage with Umbrella SDK

```typescript
import { CowSdk, OrderSigningUtils, SupportedChainId, UnsignedOrder } from '@cowprotocol/cow-sdk'
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

// Sign order using the umbrella SDK
const signingResult = await sdk.orderSigning.signOrder(orderToSign, SupportedChainId.MAINNET, adapter.signer)

// Sign cancellation
const cancellationResult = await sdk.orderSigning.signOrderCancellation(
  orderId,
  SupportedChainId.MAINNET,
  adapter.signer,
)
```

## Signing Schemes

The SDK supports multiple signing schemes:

### EIP-712 (Default)

Standard wallet signature using EIP-712 typed data:

```typescript
// Automatically uses EIP-712 for wallet signers
const result = await OrderSigningUtils.signOrder(order, chainId, signer)
```

### Smart Contract Wallets (Pre-sign)

For smart contract wallets like Safe:

```typescript
import { SigningScheme } from '@cowprotocol/sdk-order-signing'

// For smart contract wallets, specify the signing scheme
// Then execute the pre-sign transaction on-chain
```

### EIP-1271

For contracts that implement EIP-1271:

```typescript
// Used for contracts that can validate signatures
// The SDK automatically detects and handles this
```

## Integration with Order Book

This package works seamlessly with the Order Book API:

```typescript
// 1. Sign the order
const signingResult = await OrderSigningUtils.signOrder(order, chainId, signer)

// 2. Submit to order book
const orderId = await orderBookApi.sendOrder({ ...order, ...signingResult })

// 3. Cancel if needed
const cancellation = await OrderSigningUtils.signOrderCancellation(orderId, chainId, signer)
await orderBookApi.sendSignedOrderCancellations({ ...cancellation, orderUids: [orderId] })
```

> **Note:** This package handles the cryptographic aspects of CoW Protocol orders. It's typically used in conjunction with the Trading SDK or Order Book API for complete order management workflows.
