import { getEvmAddressKey, isEvmAddress } from '@cowprotocol/sdk-common'
import * as v from 'valibot'

import { ProgrammaticOrderApiError } from './types'

const MAX_DATE_SECONDS = 8_640_000_000_000n
const MAX_UINT32 = 4_294_967_295
const MAX_UINT256 = (1n << 256n) - 1n

const BYTES_32_PATTERN = /^0x[0-9a-fA-F]{64}$/
const ORDER_UID_PATTERN = /^0x[0-9a-fA-F]{112}$/
const UNSIGNED_INTEGER_PATTERN = /^\d+$/

const RECORD_SCHEMA = v.custom<Record<string, unknown>>(
  (value) => typeof value === 'object' && value !== null && !Array.isArray(value),
  'must be an object',
)
const GRAPHQL_ERRORS_SCHEMA = v.array(v.object({ message: v.string() }), 'must be an array')
const PAGE_INFO_SCHEMA = v.object({
  hasNextPage: v.boolean(),
  endCursor: v.nullable(v.string()),
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
export const OWNER_MAPPING_SCHEMA = v.object({
  address: ADDRESS_SCHEMA,
  chainId: SAFE_INTEGER_SCHEMA,
  owner: ADDRESS_SCHEMA,
})

export interface Page<T> {
  items: T[]
  hasNextPage: boolean
  endCursor: string | null
}

export function parseGraphqlData(payload: unknown): unknown {
  const envelope = parseSchema(RECORD_SCHEMA, payload, 'response')
  const errors = envelope.errors

  if (errors !== undefined && errors !== null) {
    const parsedErrors = parseSchema(GRAPHQL_ERRORS_SCHEMA, errors, 'response.errors')

    if (parsedErrors.length > 0) {
      throw new ProgrammaticOrderApiError(
        'graphql',
        `Programmatic orders API error: ${parsedErrors.map(({ message }) => message).join('; ')}`,
      )
    }
  }

  if (!('data' in envelope)) invalidResponse('response.data is missing')

  return envelope.data
}

export function parsePage<TItem extends v.GenericSchema>(
  data: unknown,
  field: string,
  itemSchema: TItem,
): Page<v.InferOutput<TItem>> {
  const root = parseSchema(RECORD_SCHEMA, data, 'response.data')
  const page = parseSchema(
    v.object({
      items: v.array(itemSchema),
      pageInfo: PAGE_INFO_SCHEMA,
    }),
    root[field],
    `response.data.${field}`,
  )

  return {
    items: page.items,
    hasNextPage: page.pageInfo.hasNextPage,
    endCursor: page.pageInfo.endCursor,
  }
}

function parseSchema<TSchema extends v.GenericSchema>(
  schema: TSchema,
  input: unknown,
  path: string,
): v.InferOutput<TSchema> {
  const result = v.safeParse(schema, input, { abortEarly: true })

  if (!result.success) {
    const issue = result.issues[0]

    invalidResponse(`${formatIssuePath(path, issue)} ${issue.message}`)
  }

  return result.output
}

function formatIssuePath(path: string, issue: v.BaseIssue<unknown>): string {
  let result = path

  for (const item of issue.path ?? []) {
    result += typeof item.key === 'number' ? `[${item.key}]` : `.${String(item.key)}`
  }

  return result
}

export function invalidResponse(message: string): never {
  throw new ProgrammaticOrderApiError('invalid-response', `Invalid programmatic orders API response: ${message}`)
}
