import { OrderStatus } from '@cowprotocol/sdk-order-book'
import * as v from 'valibot'

import {
  ADDRESS_SCHEMA,
  BYTES_32_SCHEMA,
  NON_EMPTY_STRING_SCHEMA,
  ORDER_UID_SCHEMA,
  PROGRAMMATIC_ORDER_STATUS_SCHEMA,
  SAFE_INTEGER_SCHEMA,
  SAFE_UINT256_NUMBER_SCHEMA,
  SUPPORTED_EVM_CHAIN_ID_SCHEMA,
  TIMESTAMP_SCHEMA,
  UINT32_SCHEMA,
  UINT256_SCHEMA,
} from './schemas'

export const GET_TWAP_ORDERS_PARAMS_SCHEMA = v.object({
  resolvedOwner: ADDRESS_SCHEMA,
  chainId: SUPPORTED_EVM_CHAIN_ID_SCHEMA,
})

export const GET_TWAP_PART_ORDERS_PARAMS_SCHEMA = v.object({
  eventId: v.pipe(
    v.string(),
    v.check((eventId) => eventId.trim().length > 0, 'TWAP eventId must not be empty'),
  ),
  chainId: SUPPORTED_EVM_CHAIN_ID_SCHEMA,
})

/** @see https://github.com/bleu/cow-programmatic-orders-api/blob/main/docs/supported-order-types.md#twap-time-weighted-average-price */
const TWAP_SCHEDULE_SCHEMA = v.object({
  sellToken: ADDRESS_SCHEMA,
  buyToken: ADDRESS_SCHEMA,
  receiver: ADDRESS_SCHEMA,
  partSellAmount: UINT256_SCHEMA,
  minPartLimit: UINT256_SCHEMA,
  t0: SAFE_UINT256_NUMBER_SCHEMA,
  n: SAFE_UINT256_NUMBER_SCHEMA,
  t: SAFE_UINT256_NUMBER_SCHEMA,
  span: SAFE_UINT256_NUMBER_SCHEMA,
  appData: BYTES_32_SCHEMA,
})

/** @see https://github.com/bleu/cow-programmatic-orders-api/blob/main/src/api/gql-docs/conditional-order-generator.ts */
export const TWAP_PARENT_SCHEMA = v.pipe(
  v.object({
    eventId: NON_EMPTY_STRING_SCHEMA,
    hash: BYTES_32_SCHEMA,
    chainId: SUPPORTED_EVM_CHAIN_ID_SCHEMA,
    owner: ADDRESS_SCHEMA,
    resolvedOwner: ADDRESS_SCHEMA,
    status: PROGRAMMATIC_ORDER_STATUS_SCHEMA,
    updatedAtBlock: UINT256_SCHEMA,
    additionalData: v.object({
      executedSellAmount: UINT256_SCHEMA,
      executedBuyAmount: UINT256_SCHEMA,
      executedFee: UINT256_SCHEMA,
    }),
    partOrders: v.object({ totalCount: SAFE_INTEGER_SCHEMA }),
    transaction: v.object({ blockTimestamp: TIMESTAMP_SCHEMA }),
    schedule: TWAP_SCHEDULE_SCHEMA,
  }),
  v.transform(
    ({
      additionalData: { executedSellAmount, executedBuyAmount, executedFee },
      partOrders,
      schedule,
      transaction,
      ...parent
    }) => {
      const { t0, n, t, span, ...scheduleParams } = schedule
      const createdAt = transaction.blockTimestamp

      return {
        ...parent,
        createdAt,
        partOrdersCount: partOrders.totalCount,
        executedAmounts: {
          executedSellAmount,
          executedBuyAmount,
          executedFeeAmount: executedFee, // TODO rename in indexer
        },
        schedule: {
          ...scheduleParams,
          effectiveStartTime: t0 === 0 ? createdAt : t0,
          numberOfParts: n,
          timeBetweenParts: t,
          durationOfPart: span,
        },
      }
    },
  ),
)

/** @see https://github.com/bleu/cow-programmatic-orders-api/blob/main/src/api/gql-docs/discrete-order.ts */
export const TWAP_PART_ORDER_SCHEMA = v.object({
  orderUid: ORDER_UID_SCHEMA,
  status: v.picklist([OrderStatus.OPEN, OrderStatus.FULFILLED, OrderStatus.EXPIRED, OrderStatus.CANCELLED, 'unfilled']),
  sellAmount: UINT256_SCHEMA,
  buyAmount: UINT256_SCHEMA,
  feeAmount: UINT256_SCHEMA,
  validTo: v.nullable(UINT32_SCHEMA),
  createdAt: TIMESTAMP_SCHEMA,
  executedSellAmount: v.nullable(UINT256_SCHEMA),
  executedBuyAmount: v.nullable(UINT256_SCHEMA),
  executedFeeAmount: v.nullable(UINT256_SCHEMA),
})
