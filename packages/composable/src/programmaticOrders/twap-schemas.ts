import { OrderStatus } from '@cowprotocol/sdk-order-book'
import * as v from 'valibot'

import {
  ADDRESS_SCHEMA,
  BYTES_32_SCHEMA,
  NON_EMPTY_STRING_SCHEMA,
  ORDER_UID_SCHEMA,
  PROGRAMMATIC_ORDER_STATUS_SCHEMA,
  SAFE_INTEGER_SCHEMA,
  TIMESTAMP_SCHEMA,
  UINT32_SCHEMA,
  UINT256_SCHEMA,
} from './schemas'
import type { TwapParent } from './twap-types'

/** @see https://github.com/bleu/cow-programmatic-orders-api/blob/main/docs/supported-order-types.md#twap-time-weighted-average-price */
const TWAP_SCHEDULE_SCHEMA = v.object({
  sellToken: ADDRESS_SCHEMA,
  buyToken: ADDRESS_SCHEMA,
  receiver: ADDRESS_SCHEMA,
  partSellAmount: UINT256_SCHEMA,
  minPartLimit: UINT256_SCHEMA,
  t0: UINT256_SCHEMA,
  n: UINT256_SCHEMA,
  t: UINT256_SCHEMA,
  span: UINT256_SCHEMA,
  appData: BYTES_32_SCHEMA,
})

/** @see https://github.com/bleu/cow-programmatic-orders-api/blob/main/src/api/gql-docs/conditional-order-generator.ts */
export const TWAP_PARENT_SCHEMA = v.pipe(
  v.object({
    eventId: NON_EMPTY_STRING_SCHEMA,
    hash: BYTES_32_SCHEMA,
    chainId: SAFE_INTEGER_SCHEMA,
    owner: ADDRESS_SCHEMA,
    resolvedOwner: v.nullable(ADDRESS_SCHEMA),
    status: PROGRAMMATIC_ORDER_STATUS_SCHEMA,
    transaction: v.object({ blockTimestamp: TIMESTAMP_SCHEMA }),
    schedule: TWAP_SCHEDULE_SCHEMA,
  }),
  v.transform(({ schedule, transaction, ...parent }): TwapParent => {
    const { t0, n, t, span, ...scheduleParams } = schedule
    const createdAt = transaction.blockTimestamp

    return {
      ...parent,
      createdAt,
      schedule: {
        ...scheduleParams,
        effectiveStartTime: t0 === 0n ? BigInt(createdAt) : t0,
        numberOfParts: n,
        timeBetweenParts: t,
        durationOfPart: span,
      },
    }
  }),
)

/** @see https://github.com/bleu/cow-programmatic-orders-api/blob/main/src/api/gql-docs/discrete-order.ts */
export const TWAP_PART_ORDER_SCHEMA = v.object({
  orderUid: ORDER_UID_SCHEMA,
  chainId: SAFE_INTEGER_SCHEMA,
  parentEventId: NON_EMPTY_STRING_SCHEMA,
  status: v.picklist([OrderStatus.OPEN, OrderStatus.FULFILLED, OrderStatus.EXPIRED, OrderStatus.CANCELLED, 'unfilled']),
  sellAmount: UINT256_SCHEMA,
  buyAmount: UINT256_SCHEMA,
  feeAmount: UINT256_SCHEMA,
  validTo: v.nullable(UINT32_SCHEMA),
  createdAt: TIMESTAMP_SCHEMA,
  executedSellAmount: v.nullable(UINT256_SCHEMA),
  executedBuyAmount: v.nullable(UINT256_SCHEMA),
})
