<p align="center">
  <img width="400" src="https://github.com/cowprotocol/cow-sdk/raw/main/docs/images/CoW.png" />
</p>

# SDK Composable

## Test coverage

| Statements                  | Branches                | Functions                 | Lines             |
| --------------------------- | ----------------------- | ------------------------- | ----------------- |
| ![Statements](https://img.shields.io/badge/statements-84.93%25-yellow.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-76.74%25-red.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-82.35%25-yellow.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-85.16%25-yellow.svg?style=flat) |

This package provides advanced conditional and programmable order functionality for the CoW Protocol. It enables the creation, management, and execution of sophisticated trading strategies through conditional orders that execute automatically when specified conditions are met.

## Installation

```bash
npm install @cowprotocol/sdk-composable
or
pnpm add @cowprotocol/sdk-composable
or
yarn add @cowprotocol/sdk-composable
```

## Read TWAP history

`ProgrammaticOrderApi` lists TWAP orders and their part orders for an EVM owner. It resolves current proxy mappings, so the protocol `owner` may differ from `resolvedOwner`.

```typescript
import { ProgrammaticOrderApi } from '@cowprotocol/sdk-composable'
import { SupportedChainId } from '@cowprotocol/sdk-config'

const api = new ProgrammaticOrderApi()
const twapOrders = await api.getTwapOrders({
  owner: '0x...',
  chainId: SupportedChainId.GNOSIS_CHAIN,
})
```

Each result preserves both its creation `eventId` and ComposableCoW `hash`. `schedule.numberOfParts` is the number of scheduled parts. `partOrders` contains the corresponding part orders, so its length may be smaller. `executedAmounts` sums those part orders. The schedule's `effectiveStartTime` is the creation block timestamp when the on-chain `t0` was zero. Pass `apiUrl` to the constructor to use another programmatic orders API deployment.

Source contracts: [conditional-order generator](https://github.com/bleu/cow-programmatic-orders-api/blob/main/src/api/gql-docs/conditional-order-generator.ts), [discrete order](https://github.com/bleu/cow-programmatic-orders-api/blob/main/src/api/gql-docs/discrete-order.ts), [TWAP schedule](https://github.com/bleu/cow-programmatic-orders-api/blob/main/docs/supported-order-types.md#twap-time-weighted-average-price), and the canonical [ComposableCoW TWAP order](https://github.com/cowprotocol/composable-cow/blob/main/src/types/twap/libraries/TWAPOrder.sol#L31-L42).

## Core Components

### ConditionalOrderFactory

Registry-based factory for creating different types of conditional orders:

```typescript
import { ConditionalOrderFactory } from '@cowprotocol/sdk-composable'

const factory = new ConditionalOrderFactory(registry, adapter)
const conditionalOrder = factory.fromParams(orderParams)
```

### Multiplexer

Manages batches of conditional orders using merkle trees:

```typescript
import { Multiplexer } from '@cowprotocol/sdk-composable'

const multiplexer = new Multiplexer(chainId, orders, root, location)
const proofs = multiplexer.dumpProofsAndParams()
```

### ConditionalOrder

Base class for implementing custom conditional order types:

```typescript
import { ConditionalOrder } from '@cowprotocol/sdk-composable'

class CustomOrder extends ConditionalOrder<DataType, StaticType> {
  // Implement custom conditional logic
}
```

## Usage

```typescript
import { ConditionalOrderFactory, Multiplexer, ConditionalOrder, ProofLocation } from '@cowprotocol/sdk-composable'
import { EthersV6Adapter } from '@cowprotocol/sdk-ethers-v6-adapter'
import { JsonRpcProvider, Wallet } from 'ethers'

// Configure the adapter
const provider = new JsonRpcProvider('YOUR_RPC_URL')
const wallet = new Wallet('YOUR_PRIVATE_KEY', provider)
const adapter = new EthersV6Adapter({ provider, signer: wallet })

// Create a conditional order factory
const registry = {
  twap: TWAPOrderFactory,
  dca: DCAOrderFactory,
  // ... other order types
}

const factory = new ConditionalOrderFactory(registry, adapter)

// Create conditional orders
const twapOrder = factory.fromParams({
  handler: TWAP_HANDLER_ADDRESS,
  salt: '0x...',
  staticInput: encodedTWAPData,
})

// Create multiplexer for batch management
const orders = {
  order1: twapOrder,
  // ... more orders
}

const multiplexer = new Multiplexer(SupportedChainId.MAINNET, orders, merkleRoot, ProofLocation.PRIVATE)

// Generate proofs for off-chain storage
const proofs = multiplexer.dumpProofsAndParams()
```

## Conditional Order Types

### TWAP (Time-Weighted Average Price)

Execute trades over time to achieve better average prices:

```typescript
const twapOrder = new TWAPOrder({
  handler: TWAP_HANDLER,
  sellToken: '0x...',
  buyToken: '0x...',
  sellAmount: '1000000000000000000',
  numOfParts: 10,
  timeInterval: 3600, // 1 hour intervals
  startTime: Math.floor(Date.now() / 1000),
  span: 0, // Execute indefinitely
})
```

### DCA (Dollar Cost Averaging)

Regularly buy or sell assets at predetermined intervals:

```typescript
const dcaOrder = new DCAOrder({
  handler: DCA_HANDLER,
  sellToken: '0x...', // USDC
  buyToken: '0x...', // ETH
  sellAmount: '100000000', // $100 USDC
  timeInterval: 86400, // Daily
  numOfParts: 30, // For 30 days
})
```

### Stop-Loss Orders

Automatically sell when price drops below threshold:

```typescript
const stopLossOrder = new StopLossOrder({
  handler: STOP_LOSS_HANDLER,
  sellToken: '0x...', // ETH
  buyToken: '0x...', // USDC
  sellAmount: '1000000000000000000', // 1 ETH
  strikePrice: '2000000000', // Trigger at $2000
})
```

## Advanced Features

### Merkle Tree Management

```typescript
// Create multiplexer with multiple orders
const multiplexer = new Multiplexer(
  SupportedChainId.MAINNET,
  conditionalOrders,
  undefined, // Will generate merkle root
  ProofLocation.PRIVATE,
)

// Get merkle root for on-chain storage
const root = multiplexer.getOrGenerateTree().root

// Generate proofs for specific orders
const proofs = multiplexer.dumpProofsAndParams((order) => {
  return order.isActive // Only include active orders
})
```

### Order Validation

```typescript
// Check if conditional order is valid
const validationResult = await conditionalOrder.isValid({
  owner: userAddress,
  ctx: contextData,
})

if (validationResult.isValid) {
  // Order can be executed
  const tradeableOrder = await conditionalOrder.poll({
    owner: userAddress,
    proof: merkleProof,
    provider: provider,
  })
}
```

### Context Dependencies

```typescript
// Orders that depend on external data
const conditionalOrder = new PriceBasedOrder({
  handler: PRICE_HANDLER,
  // ... order parameters
})

// Get context dependency (e.g., price oracle)
const contextDependency = conditionalOrder.getContextDependency()

// Poll with off-chain input
const [orderData, signature] = await ConditionalOrder.poll(
  owner,
  proofWithParams,
  chainId,
  provider,
  async (owner, params) => {
    // Fetch off-chain data (prices, etc.)
    return await fetchOffChainInput(params)
  },
)
```

### Order Registry Management

```typescript
// Register custom order types
const registry = {
  'custom-twap': CustomTWAPOrder,
  'limit-order': LimitOrder,
  'bracket-order': BracketOrder,
}

const factory = new ConditionalOrderFactory(registry, adapter)

// Register new order type dynamically
Multiplexer.registerOrderType('new-order-type', NewOrderClass)
```

## Smart Contract Integration

### ComposableCoW Integration

```typescript
// Set merkle root on ComposableCoW contract
const composableCowContract = adapter.getContract(COMPOSABLE_COW_CONTRACT_ADDRESS[chainId], ComposableCowABI)

// Set root with context
await composableCowContract.setRootWithContext(root, contextFactory, contextData)
```

### Proof Generation and Storage

```typescript
// Generate proofs for watchtowers/indexers
const proofsData = multiplexer.dumpProofs((order) => {
  // Filter criteria for proof inclusion
  return order.status === 'active'
})

// Store proofs off-chain (IPFS, etc.)
await uploadProofs(proofsData)

// Verify proofs on-chain when executing
const isValidProof = multiplexer.getOrGenerateTree().verify(proof, leafData)
```

### Complete TWAP Setup

```typescript
// 1. Create TWAP order
const twapOrder = new TWAPOrder({
  sellToken: WETH_ADDRESS,
  buyToken: USDC_ADDRESS,
  sellAmount: parseEther('10'), // 10 WETH
  numOfParts: 24, // 24 parts
  timeInterval: 3600, // 1 hour intervals
  startTime: Math.floor(Date.now() / 1000),
})

// 2. Create multiplexer
const multiplexer = new Multiplexer(SupportedChainId.MAINNET)
multiplexer.addOrder('twap-1', twapOrder)

// 3. Set root on ComposableCoW
const root = multiplexer.getOrGenerateTree().root
await composableCowContract.setRoot(root)

// 4. Generate proofs for watchtower
const proofs = multiplexer.dumpProofsAndParams()
await storeProofsOffChain(proofs)
```

> **Note:** This package enables advanced trading strategies through programmable conditional orders. It's designed for sophisticated users who need automated execution of complex trading logic. Most basic trading needs can be addressed with the Trading SDK.
