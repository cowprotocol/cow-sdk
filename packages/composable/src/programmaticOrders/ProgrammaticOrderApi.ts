import * as v from 'valibot'

import { GraphqlClient } from './graphql'
import { QUERY_OPTIONS_SCHEMA, SAFE_INTEGER_SCHEMA } from './schemas'
import { TWAP_ORDER_QUERY, TWAP_ORDERS_QUERY, TWAP_PART_ORDERS_QUERY } from './twap-queries'
import {
  GET_TWAP_ORDER_PARAMS_SCHEMA,
  GET_TWAP_ORDERS_PARAMS_SCHEMA,
  GET_TWAP_PART_ORDERS_PARAMS_SCHEMA,
  TWAP_PARENT_SCHEMA,
  TWAP_PART_ORDER_SCHEMA,
} from './twap-schemas'
import type {
  GetTwapOrderParams,
  GetTwapOrdersParams,
  GetTwapPartOrdersParams,
  TwapOrder,
  TwapPartOrder,
} from './twap-types'
import {
  ProgrammaticOrderApiError,
  type ProgrammaticOrderApiOptions,
  type QueryDirection,
  type QueryOptions,
  type QueryPage,
} from './types'
import { parseInput } from './validation'

const DEFAULT_API_URL = 'https://programmatic-orders.cow.fi/'
const DEFAULT_PAGE_LIMIT = 100
const DEFAULT_PAGE_OFFSET = 0
const DEFAULT_QUERY_DIRECTION: QueryDirection = 'desc'

export class ProgrammaticOrderApi {
  private readonly graphql: GraphqlClient

  /**
   * Creates a client that uses the default programmatic orders API.
   *
   * @param options - API endpoint settings.
   * @throws {@link ProgrammaticOrderApiError} when `apiUrl` is invalid.
   */
  constructor(options: ProgrammaticOrderApiOptions = {}) {
    try {
      this.graphql = new GraphqlClient(options.apiUrl ?? DEFAULT_API_URL)
    } catch (cause) {
      throw new ProgrammaticOrderApiError('Invalid programmatic orders API URL', { cause })
    }
  }

  /**
   * Returns one TWAP order by its chain-local event ID.
   *
   * @returns The TWAP order, or `null` when the event is missing or belongs to another order type.
   * @throws {@link ProgrammaticOrderApiError} when the input is invalid or the request fails.
   */
  async getTwapOrder(params: GetTwapOrderParams): Promise<TwapOrder | null> {
    const { chainId, eventId } = parseInput(GET_TWAP_ORDER_PARAMS_SCHEMA, params)

    try {
      const data = await this.graphql.query(TWAP_ORDER_QUERY, { chainId, partsChainId: chainId, eventId })
      const result = v.safeParse(v.object({ twapOrder: v.nullable(v.unknown()) }), data, { abortEarly: true })

      if (!result.success) throw new Error('Invalid TWAP order response')
      if (result.output.twapOrder === null) return null

      const orderType = v.safeParse(v.object({ orderType: v.string() }), result.output.twapOrder, { abortEarly: true })

      if (!orderType.success) throw new Error('Invalid TWAP order type')
      if (orderType.output.orderType !== 'TWAP') return null

      const details = v.parse(
        v.object({ transaction: v.object({ blockTimestamp: v.string() }) }),
        result.output.twapOrder,
      )
      const { knownParts } = v.parse(
        v.object({ knownParts: v.object({ totalCount: v.pipe(SAFE_INTEGER_SCHEMA, v.minValue(0)) }) }),
        data,
      )
      const order = v.safeParse(
        TWAP_PARENT_SCHEMA,
        {
          ...result.output.twapOrder,
          createdAt: details.transaction.blockTimestamp,
          partOrdersCount: knownParts.totalCount,
        },
        { abortEarly: true },
      )

      if (!order.success) throw new Error('Invalid TWAP order')

      return order.output
    } catch (cause) {
      throw new ProgrammaticOrderApiError('Failed to fetch TWAP order', { cause })
    }
  }

  /**
   * Returns one page of TWAP orders created by an EOA or Safe.
   *
   * Results are sorted by event ID, descending by default. Use {@link getTwapPartOrders} to fetch part orders.
   *
   * @param params - EOA or Safe address and chain. Do not pass a CoWShed proxy address.
   * @param options - Pagination and sort direction.
   * @returns The requested TWAP orders and the total number found.
   * @throws {@link ProgrammaticOrderApiError} when the input is invalid or the request fails.
   */
  async getTwapOrders(params: GetTwapOrdersParams, options: QueryOptions = {}): Promise<QueryPage<TwapOrder>> {
    const { chainId, resolvedOwner, updatedAtBlockGte } = parseInput(GET_TWAP_ORDERS_PARAMS_SCHEMA, params)
    const {
      direction = DEFAULT_QUERY_DIRECTION,
      limit = DEFAULT_PAGE_LIMIT,
      offset = DEFAULT_PAGE_OFFSET,
    } = parseInput(QUERY_OPTIONS_SCHEMA, options)

    try {
      const page = await this.graphql.queryPage({
        query: TWAP_ORDERS_QUERY,
        page: 'twapOrders',
        variables: {
          resolvedOwner,
          chainId,
          offset,
          limit,
          direction,
          ...(updatedAtBlockGte === undefined ? {} : { updatedAtBlockGte: updatedAtBlockGte.toString() }),
        },
        itemSchema: TWAP_PARENT_SCHEMA,
      })

      return page
    } catch (cause) {
      throw new ProgrammaticOrderApiError('Failed to fetch TWAP orders', { cause })
    }
  }

  /**
   * Returns known parts, including unconfirmed candidates, sorted by expiry and UID, descending by default.
   *
   * @param params - Parent event ID and chain.
   * @param options - Pagination and sort direction.
   * @returns The requested part orders and the total number found.
   * @throws {@link ProgrammaticOrderApiError} when the input is invalid or the request fails.
   */
  async getTwapPartOrders(
    params: GetTwapPartOrdersParams,
    options: QueryOptions = {},
  ): Promise<QueryPage<TwapPartOrder>> {
    const { chainId, eventId } = parseInput(GET_TWAP_PART_ORDERS_PARAMS_SCHEMA, params)
    const {
      direction = DEFAULT_QUERY_DIRECTION,
      limit = DEFAULT_PAGE_LIMIT,
      offset = DEFAULT_PAGE_OFFSET,
    } = parseInput(QUERY_OPTIONS_SCHEMA, options)

    try {
      const page = await this.graphql.queryPage({
        query: TWAP_PART_ORDERS_QUERY,
        page: 'partOrders',
        variables: {
          chainId,
          parentEventId: eventId,
          offset,
          limit,
          direction,
        },
        itemSchema: TWAP_PART_ORDER_SCHEMA,
      })

      return page
    } catch (cause) {
      throw new ProgrammaticOrderApiError('Failed to fetch TWAP part orders', { cause })
    }
  }
}
