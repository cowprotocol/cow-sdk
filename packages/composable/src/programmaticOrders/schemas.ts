import { isEvmChain, isSupportedChain, type SupportedChainId } from '@cowprotocol/sdk-config'
import { getEvmAddressKey, isEvmAddress } from '@cowprotocol/sdk-common'
import * as v from 'valibot'

import type { QueryDirection } from './types'

const MAX_PAGE_LIMIT = 1000
const MAX_OFFSET = 2 ** 31 - 1 // GraphQL Int maximum

const MAX_DATE_SECONDS = 8_640_000_000_000n
const MAX_UINT32 = 4_294_967_295
const MAX_UINT256 = (1n << 256n) - 1n

const BYTES_32_PATTERN = /^0x[0-9a-fA-F]{64}$/
const ORDER_UID_PATTERN = /^0x[0-9a-fA-F]{112}$/
const UNSIGNED_INTEGER_PATTERN = /^\d+$/

const QUERY_DIRECTIONS = ['asc', 'desc'] as const satisfies readonly QueryDirection[]

export const QUERY_OPTIONS_SCHEMA = v.object({
  limit: v.optional(v.pipe(v.number(), v.safeInteger(), v.minValue(1), v.maxValue(MAX_PAGE_LIMIT))),
  offset: v.optional(v.pipe(v.number(), v.safeInteger(), v.minValue(0), v.maxValue(MAX_OFFSET))),
  direction: v.optional(v.picklist(QUERY_DIRECTIONS)),
})

export const ADDRESS_SCHEMA = v.pipe(
  v.string(),
  v.check((address) => isEvmAddress(address), 'must be an EVM address'),
  v.transform((address) => getEvmAddressKey(address)),
)
export const BYTES_32_SCHEMA = v.pipe(v.string(), v.regex(BYTES_32_PATTERN, 'must be bytes32'))
export const NON_EMPTY_STRING_SCHEMA = v.pipe(v.string(), v.minLength(1, 'must not be empty'))
export const ORDER_UID_SCHEMA = v.pipe(v.string(), v.regex(ORDER_UID_PATTERN, 'must be an order UID'))
export const SAFE_INTEGER_SCHEMA = v.pipe(v.number(), v.safeInteger('must be a safe integer'))
export const SUPPORTED_EVM_CHAIN_ID_SCHEMA = v.pipe(
  SAFE_INTEGER_SCHEMA,
  v.check(
    (chainId): chainId is SupportedChainId => isSupportedChain(chainId) && isEvmChain(chainId),
    'must be a supported EVM chain',
  ),
)
export const UINT32_SCHEMA = v.pipe(
  SAFE_INTEGER_SCHEMA,
  v.minValue(0, 'must be a uint32'),
  v.maxValue(MAX_UINT32, 'must be a uint32'),
)
export const UINT256_SCHEMA = v.pipe(
  v.string(),
  v.regex(UNSIGNED_INTEGER_PATTERN, 'must be a uint256 decimal string'),
  v.maxLength(78, 'must be a uint256 decimal string'),
  v.transform((value) => BigInt(value)),
  v.maxValue(MAX_UINT256, 'must fit uint256'),
)
export const SAFE_UINT256_NUMBER_SCHEMA = v.pipe(
  UINT256_SCHEMA,
  v.transform(Number),
  v.safeInteger('must be a safe integer'),
)
export const TIMESTAMP_SCHEMA = v.pipe(
  UINT256_SCHEMA,
  v.maxValue(MAX_DATE_SECONDS, 'is outside the supported date range'),
  v.transform((value) => Number(value)),
)
export const PROGRAMMATIC_ORDER_STATUS_SCHEMA = v.picklist(['Active', 'Cancelled', 'Completed'])
