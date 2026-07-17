import { isEvmChain, isSupportedChain } from '@cowprotocol/sdk-config'
import type { SupportedChainId } from '@cowprotocol/sdk-config'
import { getEvmAddressKey, isEvmAddress, log } from '@cowprotocol/sdk-common'

import { ProgrammaticOrdersClient } from './client'
import { ProgrammaticOrderApiError, type ProgrammaticOrderApiOptions } from './common/types'
import { sumExecutedAmounts } from './twap/parse'
import { getTwapParents, getTwapPartOrders } from './twap/queries'
import type { GetTwapOrdersParams, TwapOrder } from './twap/types'

/** Read-only client for programmatic orders. */
export class ProgrammaticOrderApi {
  private readonly client: ProgrammaticOrdersClient

  /**
   * Creates a client backed by the default programmatic orders API.
   *
   * @param options - Optional API endpoint configuration.
   * @throws {@link ProgrammaticOrderApiError} with kind `invalid-request` when `apiUrl` is invalid.
   */
  constructor(options: ProgrammaticOrderApiOptions = {}) {
    this.client = new ProgrammaticOrdersClient(options.apiUrl)
  }

  /**
   * Returns all TWAP orders and their part orders for an owner on a supported EVM chain.
   *
   * @remarks
   * Resolves EOA/proxy owner mappings and follows every API page. `partOrders`
   * contains part orders; scheduled parts without a part order are not included.
   * A failed page rejects the request rather than returning partial results.
   *
   * @param params - Owner address and chain to query.
   * @returns All TWAP orders and their part orders.
   * @throws {@link ProgrammaticOrderApiError} when input validation, the request,
   * GraphQL, or response validation fails.
   */
  async getTwapOrders(params: GetTwapOrdersParams): Promise<TwapOrder[]> {
    const { owner, chainId } = params
    const requestedOwner = validateRequest(owner, chainId)

    log(`ProgrammaticOrderApi: fetching TWAP orders for ${requestedOwner} on chain ${chainId}`)

    const { resolvedOwner, owners } = await this.client.getOwnerScope(requestedOwner, chainId)
    const parents = await getTwapParents(this.client, resolvedOwner, chainId, owners)
    const partOrdersByParent = await getTwapPartOrders(
      this.client,
      chainId,
      parents.map(({ eventId }) => eventId),
    )

    const orders = parents.map<TwapOrder>((parent) => {
      const partOrders = partOrdersByParent.get(parent.eventId) ?? []

      return {
        eventId: parent.eventId,
        hash: parent.hash,
        chainId,
        owner: parent.owner,
        resolvedOwner,
        status: parent.status,
        createdAt: parent.createdAt,
        schedule: parent.schedule,
        partOrders,
        executedAmounts: sumExecutedAmounts(partOrders),
      }
    })

    log(
      `ProgrammaticOrderApi: fetched ${orders.length} TWAP orders and ${orders.reduce((sum, order) => sum + order.partOrders.length, 0)} part orders`,
    )

    return orders
  }
}

function validateRequest(owner: string, chainId: SupportedChainId): string {
  if (!isEvmAddress(owner)) {
    throw new ProgrammaticOrderApiError('invalid-request', `Invalid EVM owner address: ${owner}`)
  }

  if (!Number.isInteger(chainId) || !isSupportedChain(chainId) || !isEvmChain(chainId)) {
    throw new ProgrammaticOrderApiError('invalid-request', `Unsupported EVM chain: ${chainId}`)
  }

  return getEvmAddressKey(owner)
}
