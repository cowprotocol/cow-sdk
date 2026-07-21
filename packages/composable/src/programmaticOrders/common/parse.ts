import { getEvmAddressKey, isEvmAddress } from '@cowprotocol/sdk-common'
import * as v from 'valibot'

const MAX_DATE_SECONDS = 8_640_000_000_000n
const MAX_UINT32 = 4_294_967_295
const MAX_UINT256 = (1n << 256n) - 1n

const BYTES_32_PATTERN = /^0x[0-9a-fA-F]{64}$/
const ORDER_UID_PATTERN = /^0x[0-9a-fA-F]{112}$/
const UNSIGNED_INTEGER_PATTERN = /^\d+$/

export const ADDRESS_SCHEMA = v.pipe(
  v.string(),
  v.check((address) => isEvmAddress(address), 'must be an EVM address'),
  v.transform((address) => getEvmAddressKey(address)),
)
export const BYTES_32_SCHEMA = v.pipe(v.string(), v.regex(BYTES_32_PATTERN, 'must be bytes32'))
export const NON_EMPTY_STRING_SCHEMA = v.pipe(v.string(), v.minLength(1, 'must not be empty'))
export const ORDER_UID_SCHEMA = v.pipe(v.string(), v.regex(ORDER_UID_PATTERN, 'must be an order UID'))
export const SAFE_INTEGER_SCHEMA = v.pipe(v.number(), v.safeInteger('must be a safe integer'))
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
export const TIMESTAMP_SCHEMA = v.pipe(
  UINT256_SCHEMA,
  v.maxValue(MAX_DATE_SECONDS, 'is outside the supported date range'),
  v.transform((value) => Number(value)),
)
export const PROGRAMMATIC_ORDER_STATUS_SCHEMA = v.picklist(['Active', 'Cancelled', 'Completed'])
