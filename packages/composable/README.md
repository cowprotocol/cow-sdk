<p align="center">
  <img width="400" src="https://github.com/cowprotocol/cow-sdk/raw/main/docs/images/CoW.png" />
</p>

# SDK Composable

## Test coverage

| Statements                                                                               | Branches                                                                             | Functions                                                                              | Lines                                                                          |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| ![Statements](https://img.shields.io/badge/statements-100%25-brightgreen.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-100%25-brightgreen.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-100%25-brightgreen.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-100%25-brightgreen.svg?style=flat) |

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

```typescript
import { ProgrammaticOrderApi } from '@cowprotocol/sdk-composable'
import { SupportedChainId } from '@cowprotocol/sdk-config'

const api = new ProgrammaticOrderApi()
const { items: twaps } = await api.getTwapOrders({
  resolvedOwner: '0x...',
  chainId: SupportedChainId.GNOSIS_CHAIN,
})
const { items: parts } = await api.getTwapPartOrders(
  {
    eventId: twaps[0].eventId,
    chainId: SupportedChainId.GNOSIS_CHAIN,
  },
  {
    offset: 0,
    limit: 10,
    direction: 'desc',
  },
)
```

Both methods return `QueryPage<T>` and accept optional `QueryOptions` (`offset`, `limit`, `direction`). Parent results include execution totals and indexed part counts; pass the returned `eventId` to fetch parts.

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

### JIT Poller

The package exposes two Poller APIs: the low-level `ComposableCowPoller` below only reads state and encodes calldata, while `ComposableCowPollerSdk` adds signing and transaction submission through the configured adapter.

```typescript
import { ComposableCowPoller, type ComposableCowPollerSchedule } from '@cowprotocol/sdk-composable'
import { setGlobalAdapter } from '@cowprotocol/sdk-common'

setGlobalAdapter(adapter)

const poller = new ComposableCowPoller(pollerAddress)
const schedule: ComposableCowPollerSchedule = {
  handler,
  authEpoch,
  funder,
  owner,
  salt,
  staticInput,
}
const scheduleId = poller.getScheduleId(schedule)

// Submit this calldata to pollerAddress from schedule.funder.
const registerCalldata = poller.encodeRegister(schedule)

// Or authorize registration for submission by another account.
const deadline = Math.floor(Date.now() / 1000) + 15 * 60
const typedData = poller.getRegisterTypedData({ chainId, schedule, deadline })
const signature = await signer.signTypedData(typedData.domain, typedData.types, typedData.message)
const signedRegisterCalldata = poller.encodeRegisterWithSignature(schedule, deadline, signature)

// Direct revocation must be submitted by schedule.funder.
const revokeCalldata = poller.encodeRevoke(schedule)

// Or authorize revocation for submission by another account.
const revokeAuthorization = {
  handler: schedule.handler,
  authEpoch: schedule.authEpoch,
  funder: schedule.funder,
  owner: schedule.owner,
  salt: schedule.salt,
}
const revokeDeadline = Math.floor(Date.now() / 1000) + 15 * 60
const revokeTypedData = poller.getRevokeTypedData({
  chainId,
  ...revokeAuthorization,
  deadline: revokeDeadline,
})
const revokeSignature = await signer.signTypedData(
  revokeTypedData.domain,
  revokeTypedData.types,
  revokeTypedData.message,
)
const signedRevokeCalldata = poller.encodeRevokeWithSignature(
  revokeAuthorization,
  revokeDeadline,
  revokeSignature,
)

// These variants must execute from the funder's CowShed.
// For registration, schedule.owner must equal that CowShed.
const shedRegisterCalldata = poller.encodeRegisterFromShed(schedule)
const shedRevokeCalldata = poller.encodeRevokeFromShed(schedule)
```

Bundle either CowShed variant with other setup or cleanup calls through `@cowprotocol/sdk-cow-shed`. Custom CowShed deployments can supply their factory addresses, proxy creation code, and EIP-712 domain version directly; no SDK subclass or version cast is needed.

```typescript
import { CowShedSdk } from '@cowprotocol/sdk-cow-shed'

const cowShedSdk = new CowShedSdk(adapter, {
  ...cowShedDeployment,
  domainVersion: '2.1.0',
})
const cowShed = cowShedSdk.getCowShedAccount(chainId, funder)

const registration = await cowShedSdk.signCalls({
  chainId,
  signer,
  calls: [
    {
      target: pollerAddress,
      callData: poller.encodeRegisterFromShed({ ...schedule, owner: cowShed }),
      value: 0n,
      isDelegateCall: false,
      allowFailure: false,
    },
  ],
})
```

Use `ComposableCowPollerSdk` to sign or submit transactions through the configured adapter. Its `poller` property exposes the same low-level calldata and read methods shown above. Using that `schedule`, choose either the direct flow or the signature flow below; do not run both for the same registration.

```typescript
import { ComposableCowPollerSdk } from '@cowprotocol/sdk-composable'

const pollerSdk = new ComposableCowPollerSdk({ chainId, pollerAddress, signer }, adapter)
const deadline = Math.floor(Date.now() / 1000) + 15 * 60

// Direct flow: submit registration with the adapter's signer.
const transaction = await pollerSdk.register({ schedule })
await transaction.wait()

// Signature flow: sign the schedule's current authEpoch and encode the authorized call.
const authorization = await pollerSdk.signRegister({ schedule, deadline })
// authorization.calldata is ready for a hook or relayed transaction.
// authorization.typedData and authorization.signature are also available for inspection.

// Alternatively, submit the authorization now with a relayer signer.
const relayedTransaction = await pollerSdk.registerWithSignature({
  schedule,
  deadline,
  signature: authorization.signature,
  signer: relayerSigner,
})
await relayedTransaction.wait()
```

`signRevoke` follows the same signature flow and signs the schedule identity together with its current `authEpoch`.

The schedule fields are:

- `handler`: the registered conditional order's handler.
- `authEpoch`: the schedule ID's current replay-protection epoch; it starts at zero and increments on revocation.
- `funder`: the account from which the Poller draws sell tokens.
- `owner`: the ComposableCoW conditional-order owner that receives those tokens.
- `salt`: the registered conditional order's salt.
- `staticInput`: the registered conditional order's encoded static input.

The low-level `ComposableCowPoller` only encodes these transactions; its consumer owns signing, gas policy, submission, and confirmation. Submit direct registration and revocation calldata to `pollerAddress` from `schedule.funder`, submit `signedRegisterCalldata` through a relayer, or include a CowShed variant in a bundle executed by the funder's own CowShed. `registerFromShed` additionally requires `schedule.owner` to equal that CowShed. The signed calldata contains the schedule, deadline, and signature; replay protection is scoped to the schedule ID through `authEpoch`. Use `poller.getComposableCowAddress()`, `poller.getCowShedFactoryAddress()`, and `poller.getSchedule(scheduleId)` to read Poller state.

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
  dca: DCAOrderFactory, // WIP: not implemented
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

### DCA (Dollar Cost Averaging) — WIP

> `DCAOrder` is not implemented or exported yet.

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

### Stop-Loss Orders — WIP

> `StopLossOrder` is not implemented or exported yet.

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
