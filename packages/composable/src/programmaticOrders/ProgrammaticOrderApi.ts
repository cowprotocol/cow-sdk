import { GraphqlClient } from './graphql'
import { QUERY_OPTIONS_SCHEMA } from './schemas'
import { TWAP_ORDERS_QUERY, TWAP_PART_ORDERS_QUERY } from './twap-queries'
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
  type QueryOptions,
  type QueryPage,
} from './types'
import { parseInput } from './validation'

const DEFAULT_API_URL = 'https://programmatic-orders.cow.fi/'

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
      const { items } = await this.graphql.queryPage({
        query: TWAP_ORDERS_QUERY,
        page: 'twapOrders',
        variables: { chainId, eventId, limit: 1 },
        itemSchema: TWAP_PARENT_SCHEMA,
      })

      return items[0] ?? null
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
    const { direction, limit, offset } = parseInput(QUERY_OPTIONS_SCHEMA, options)

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
    const { direction, limit, offset } = parseInput(QUERY_OPTIONS_SCHEMA, options)

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
