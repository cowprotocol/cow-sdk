import { isEvmChain, isSupportedChain } from '@cowprotocol/sdk-config'
import { getEvmAddressKey, isEvmAddress, log } from '@cowprotocol/sdk-common'

import { ProgrammaticOrderApiError, type ProgrammaticOrderApiOptions } from './common/types'
import { GraphqlClient } from './graphql'
import { sumExecutedAmounts } from './twap/parse'
import { getTwapParents, getTwapPartOrders } from './twap/queries'
import type { GetTwapOrdersParams, TwapOrder } from './twap/types'

const DEFAULT_API_URL = 'https://cow-programmatic-order.bleu.blue'

export class ProgrammaticOrderApi {
  private readonly graphql: GraphqlClient

  /**
   * Creates a client backed by the default programmatic orders API.
   *
   * @param options - Optional API endpoint configuration.
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
   * Returns all TWAP orders and their part orders for a canonical owner on a supported EVM chain.
   *
   * @remarks
   * Follows every API page. `partOrders` contains part orders; scheduled parts without a part order are not included.
   * Progress callbacks contain fully assembled TWAP orders. A failed page rejects the request, but TWAP orders emitted
   * by earlier callbacks remain provisional.
   *
   * @param params - Controlling EOA or Safe address and chain to query. The address must not be a CoWShed proxy.
   * @returns All TWAP orders and their part orders.
   * @throws {@link ProgrammaticOrderApiError} when input validation, the request,
   * GraphQL, or response validation fails.
   */
  async getTwapOrders(params: GetTwapOrdersParams): Promise<TwapOrder[]> {
    const { chainId, onProgress } = params

    if (!isEvmAddress(params.resolvedOwner)) {
      throw new ProgrammaticOrderApiError(`Invalid EVM owner address: ${params.resolvedOwner}`)
    }

    if (!Number.isInteger(chainId) || !isSupportedChain(chainId) || !isEvmChain(chainId)) {
      throw new ProgrammaticOrderApiError(`Unsupported EVM chain: ${chainId}`)
    }

    const resolvedOwner = getEvmAddressKey(params.resolvedOwner)

    log(`ProgrammaticOrderApi: fetching TWAP orders for ${resolvedOwner} on chain ${chainId}`)

    try {
      const orders: TwapOrder[] = []
      const parents = await getTwapParents(this.graphql, resolvedOwner, chainId)

      for (const parent of parents) {
        const partOrders = await getTwapPartOrders(this.graphql, chainId, parent.eventId)
        const order = {
          ...parent,
          chainId,
          resolvedOwner,
          partOrders,
          executedAmounts: sumExecutedAmounts(partOrders),
        } satisfies TwapOrder

        orders.push(order)
        onProgress?.(order)
      }

      log(
        `ProgrammaticOrderApi: fetched ${orders.length} TWAP orders and ${orders.reduce((sum, order) => sum + order.partOrders.length, 0)} part orders`,
      )

      return orders
    } catch (cause) {
      if (cause instanceof ProgrammaticOrderApiError) throw cause

      throw new ProgrammaticOrderApiError('Failed to fetch TWAP orders', { cause })
    }
  }
}
