import type { SupportedChainId } from '@cowprotocol/sdk-config'
import type { OrderStatus } from '@cowprotocol/sdk-order-book'

import type { ProgrammaticOrderStatus } from '../common/types'

/** Input for querying TWAP orders. */
export interface GetTwapOrdersParams {
  /** EOA or mapped programmatic-order proxy address. */
  owner: string
  /** Supported EVM chain containing the orders. */
  chainId: SupportedChainId
}

/**
 * Orderbook status of a TWAP part order.
 *
 * Unlike `OrderStatus` from `@cowprotocol/sdk-order-book`, this API reports
 * `unfilled` when an order leaves the orderbook without settling, and does not
 * report `presignaturePending`.
 * @see https://github.com/bleu/cow-programmatic-orders-api/blob/main/schema/tables.ts#L36-L42
 * @see https://github.com/bleu/cow-programmatic-orders-api/blob/main/src/api/gql-docs/discrete-order.ts
 */
export type TwapPartOrderStatus =
  | OrderStatus.OPEN
  | OrderStatus.FULFILLED
  | OrderStatus.EXPIRED
  | OrderStatus.CANCELLED
  | 'unfilled'

/**
 * TWAP schedule. Unlike {@link TwapStruct},
 * `effectiveStartTime` is the creation block timestamp when on-chain `t0` was zero.
 * @see https://github.com/bleu/cow-programmatic-orders-api/blob/main/docs/supported-order-types.md#twap-time-weighted-average-price
 * @see https://github.com/cowprotocol/composable-cow/blob/main/src/types/twap/libraries/TWAPOrder.sol#L31-L42
 */
export interface TwapSchedule {
  sellToken: string
  buyToken: string
  receiver: string
  partSellAmount: bigint
  minPartLimit: bigint
  /** Effective Unix start time in seconds. */
  effectiveStartTime: bigint
  numberOfParts: bigint
  /** Seconds between consecutive parts. */
  timeBetweenParts: bigint
  /** Part validity in seconds; zero means the full interval. */
  durationOfPart: bigint
  appData: string
}

/**
 * Part order generated for one scheduled part.
 * @see https://github.com/bleu/cow-programmatic-orders-api/blob/main/src/api/gql-docs/discrete-order.ts
 */
export interface TwapPartOrder {
  orderUid: string
  status: TwapPartOrderStatus
  sellAmount: bigint
  buyAmount: bigint
  feeAmount: bigint
  /** Unix expiry time in seconds. */
  validTo: number | null
  /** Unix creation time in seconds. */
  createdAt: number
  executedSellAmount: bigint | null
  executedBuyAmount: bigint | null
}

export interface TwapExecutedAmounts {
  /** Executed sell and buy amounts summed over all part orders. */
  executedSellAmount: bigint
  executedBuyAmount: bigint
}

/**
 * TWAP order with its schedule, part orders, and executed amounts.
 * @see https://github.com/bleu/cow-programmatic-orders-api/blob/main/src/api/gql-docs/conditional-order-generator.ts
 * @see https://github.com/bleu/cow-programmatic-orders-api/blob/main/src/api/gql-docs/owner-mapping.ts
 */
export interface TwapOrder {
  /** Opaque creation-event identity. Unique together with `chainId`. */
  eventId: string
  /** ComposableCoW single-order hash. Multiple creation events may share it. */
  hash: string
  chainId: SupportedChainId
  /** Protocol owner used by the generated CoW orders, which may be a proxy. */
  owner: string
  /** Current owner after applying the indexer's proxy mapping. */
  resolvedOwner: string
  status: ProgrammaticOrderStatus
  /** Unix creation time in seconds. */
  createdAt: number
  schedule: TwapSchedule
  partOrders: TwapPartOrder[]
  executedAmounts: TwapExecutedAmounts
}

export interface TwapParent {
  eventId: string
  hash: string
  chainId: number
  owner: string
  resolvedOwner: string | null
  status: ProgrammaticOrderStatus
  createdAt: number
  schedule: TwapSchedule
}

export interface TwapPartOrderRecord extends TwapPartOrder {
  chainId: number
  parentEventId: string
}
