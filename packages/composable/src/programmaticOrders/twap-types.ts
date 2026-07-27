import type { SupportedChainId } from '@cowprotocol/sdk-config'
import type { OrderStatus } from '@cowprotocol/sdk-order-book'

import type { ProgrammaticOrderStatus } from './types'

/** Input for querying TWAP orders. */
export interface GetTwapOrdersParams {
  /** EOA or Safe that created the TWAP order. Do not pass a CoWShed proxy address. */
  resolvedOwner: string
  /** Chain containing the TWAP orders. */
  chainId: SupportedChainId
}

/** Input for querying one page of TWAP part orders. */
export interface GetTwapPartOrdersParams {
  /** Parent event ID returned by `getTwapOrders`. */
  eventId: string
  /** Chain containing the part orders. */
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
 * Schedule for a TWAP order. Unlike {@link TwapStruct}, `effectiveStartTime`
 * uses the creation block timestamp when the on-chain `t0` value is zero.
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
  /** Actual fee charged at settlement, in the sell token. */
  executedFeeAmount: bigint | null
}

export interface TwapExecutedAmounts {
  /** Execution totals for all part orders. */
  executedSellAmount: bigint
  executedBuyAmount: bigint
  executedFeeAmount: bigint
}

/**
 * TWAP order with its schedule and execution totals.
 * @see https://github.com/bleu/cow-programmatic-orders-api/blob/main/src/api/gql-docs/conditional-order-generator.ts
 * @see https://github.com/bleu/cow-programmatic-orders-api/blob/main/src/api/gql-docs/owner-mapping.ts
 */
export interface TwapOrder {
  /** Creation event ID. Unique within a chain. */
  eventId: string
  /** ComposableCoW order hash. More than one creation event can have the same hash. */
  hash: string
  chainId: SupportedChainId
  /** Address that owns the generated CoW orders: a CoWShed proxy or Safe. */
  owner: string
  /** EOA behind a known CoWShed proxy, or `owner` for a Safe. */
  resolvedOwner: string
  status: ProgrammaticOrderStatus
  /** Unix creation time in seconds. */
  createdAt: number
  /** Block in which the indexer last updated this TWAP or one of its part orders. */
  updatedAtBlock: bigint
  /** Number of part orders currently reported for this parent. */
  partOrdersCount: number
  schedule: TwapSchedule
  executedAmounts: TwapExecutedAmounts
}
