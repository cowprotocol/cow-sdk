import type { SupportedChainId } from '@cowprotocol/sdk-config'
import { areAddressesEqual } from '@cowprotocol/sdk-common'

import type { GraphqlClient } from '../graphql'
import { TWAP_PARENT_SCHEMA, TWAP_PART_ORDER_SCHEMA } from './parse'
import type { TwapParent, TwapPartOrder } from './types'

const PAGE_SIZE = 1000

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
  query TwapPartOrders($chainId: Int!, $parentEventId: String!, $after: String, $limit: Int!) {
    partOrders: discreteOrders(
      where: {
        chainId: $chainId
        conditionalOrderGeneratorId: $parentEventId
      }
      after: $after
      limit: $limit
    ) {
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
  client: GraphqlClient,
  resolvedOwner: string,
  chainId: SupportedChainId,
): Promise<TwapParent[]> {
  const parents = await client.paginate({
    query: TWAP_ORDERS_QUERY,
    page: 'twapOrders',
    variables: (after) => ({
      resolvedOwner,
      chainId,
      after,
      limit: PAGE_SIZE,
    }),
    itemSchema: TWAP_PARENT_SCHEMA,
  })

  for (const parent of parents) {
    if (
      parent.chainId !== chainId ||
      parent.resolvedOwner === null ||
      !areAddressesEqual(parent.resolvedOwner, resolvedOwner)
    ) {
      throw new Error('Programmatic orders API returned a TWAP order with an unexpected owner or chain')
    }
  }

  return parents
}

export async function getTwapPartOrders(
  client: GraphqlClient,
  chainId: SupportedChainId,
  parentEventId: string,
): Promise<TwapPartOrder[]> {
  const records = await client.paginate({
    query: TWAP_PART_ORDERS_QUERY,
    page: 'partOrders',
    variables: (after) => ({
      chainId,
      parentEventId,
      after,
      limit: PAGE_SIZE,
    }),
    itemSchema: TWAP_PART_ORDER_SCHEMA,
  })
  const partOrders: TwapPartOrder[] = []

  for (const record of records) {
    const { chainId: recordChainId, parentEventId: recordParentEventId, ...partOrder } = record

    if (recordChainId !== chainId || recordParentEventId !== parentEventId) {
      throw new Error('Programmatic orders API returned a part order for an unexpected TWAP order or chain')
    }

    partOrders.push(partOrder)
  }

  return partOrders
}
