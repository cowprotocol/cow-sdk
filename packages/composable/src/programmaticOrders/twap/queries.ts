import type { SupportedChainId } from '@cowprotocol/sdk-config'
import { areAddressesEqual } from '@cowprotocol/sdk-common'

import { PAGE_SIZE, type ProgrammaticOrdersClient } from '../client'
import { invalidResponse, parsePage } from '../common/parse'
import { TWAP_PARENT_SCHEMA, TWAP_PART_ORDER_SCHEMA } from './parse'
import type { TwapParent, TwapPartOrder, TwapPartOrderRecord } from './types'

const PART_PARENT_BATCH_SIZE = 100

const TWAP_ORDERS_QUERY = `
  query TwapOrders(
    $resolvedOwner: String!
    $chainId: Int!
    $after: String
    $limit: Int!
  ) {
    twapOrders: conditionalOrderGenerators(
      where: {
        chainId: $chainId
        orderType: TWAP
        resolvedOwner: $resolvedOwner
      }
      after: $after
      limit: $limit
    ) {
      items {
        eventId
        chainId
        hash
        owner
        resolvedOwner
        status
        schedule: decodedParams
        transaction {
          blockTimestamp
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

const TWAP_PART_ORDERS_QUERY = `
  query TwapPartOrders($where: discreteOrderFilter!, $after: String, $limit: Int!) {
    partOrders: discreteOrders(where: $where, after: $after, limit: $limit) {
      items {
        orderUid
        chainId
        parentEventId: conditionalOrderGeneratorId
        status
        sellAmount
        buyAmount
        feeAmount
        validTo
        createdAt: creationDate
        executedSellAmount
        executedBuyAmount
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

export async function getTwapParents(
  client: ProgrammaticOrdersClient,
  resolvedOwner: string,
  chainId: SupportedChainId,
): Promise<TwapParent[]> {
  const parents = await client.paginate('TWAP orders', async (after) => {
    const data = await client.query('TWAP orders', TWAP_ORDERS_QUERY, {
      resolvedOwner,
      chainId,
      after,
      limit: PAGE_SIZE,
    })

    return parsePage(data, 'twapOrders', TWAP_PARENT_SCHEMA)
  })
  const uniqueParents = new Map<string, TwapParent>()

  for (const parent of parents) {
    const matchesResolvedOwner = parent.resolvedOwner !== null && areAddressesEqual(parent.resolvedOwner, resolvedOwner)

    if (parent.chainId !== chainId || !matchesResolvedOwner) {
      invalidResponse('twapOrders.items contains a row for another owner or chain')
    }

    const existing = uniqueParents.get(parent.eventId)

    if (existing && existing.hash !== parent.hash) {
      invalidResponse(`twapOrders.items contains conflicting rows for event ${parent.eventId}`)
    }

    if (!existing) uniqueParents.set(parent.eventId, parent)
  }

  return [...uniqueParents.values()]
}

export async function getTwapPartOrders(
  client: ProgrammaticOrdersClient,
  chainId: SupportedChainId,
  parentEventIds: string[],
): Promise<Map<string, TwapPartOrder[]>> {
  const partOrdersByUid = new Map<string, TwapPartOrderRecord>()

  for (let index = 0; index < parentEventIds.length; index += PART_PARENT_BATCH_SIZE) {
    const batch = parentEventIds.slice(index, index + PART_PARENT_BATCH_SIZE)
    const parentIds = new Set(batch)
    const partOrders = await client.paginate('TWAP part orders', async (after) => {
      const data = await client.query('TWAP part orders', TWAP_PART_ORDERS_QUERY, {
        where: {
          chainId,
          OR: batch.map((parentEventId) => ({ conditionalOrderGeneratorId: parentEventId })),
        },
        after,
        limit: PAGE_SIZE,
      })

      return parsePage(data, 'partOrders', TWAP_PART_ORDER_SCHEMA)
    })

    for (const partOrder of partOrders) {
      if (partOrder.chainId !== chainId || !parentIds.has(partOrder.parentEventId)) {
        invalidResponse('partOrders.items contains a row for another TWAP order or chain')
      }

      const existing = partOrdersByUid.get(partOrder.orderUid)

      if (existing && existing.parentEventId !== partOrder.parentEventId) {
        invalidResponse(`partOrders.items contains conflicting rows for order ${partOrder.orderUid}`)
      }

      if (!existing) partOrdersByUid.set(partOrder.orderUid, partOrder)
    }
  }

  const result = new Map<string, TwapPartOrder[]>()

  for (const { chainId: _chainId, parentEventId, ...partOrder } of partOrdersByUid.values()) {
    const parentPartOrders = result.get(parentEventId)

    if (parentPartOrders) parentPartOrders.push(partOrder)
    else result.set(parentEventId, [partOrder])
  }

  return result
}
