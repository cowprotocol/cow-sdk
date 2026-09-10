import type { QueryDirection } from './types'

const DEFAULT_PAGE_LIMIT = 100
const DEFAULT_PAGE_OFFSET = 0
const DEFAULT_QUERY_DIRECTION: QueryDirection = 'desc'

export const TWAP_ORDERS_QUERY = `
  query TwapOrders($resolvedOwner: String, $eventId: String, $chainId: Int!, $offset: Int! = ${DEFAULT_PAGE_OFFSET}, $limit: Int! = ${DEFAULT_PAGE_LIMIT}, $direction: String! = "${DEFAULT_QUERY_DIRECTION}", $updatedAtBlockGte: BigInt) {
    twapOrders: programmaticOrders(
      where: {
        chainId: $chainId
        eventId: $eventId
        orderType: TWAP
        resolvedOwner: $resolvedOwner
        updatedAtBlock_gte: $updatedAtBlockGte
      }
      offset: $offset
      limit: $limit
      orderBy: "eventId"
      orderDirection: $direction
    ) {
      items {
        eventId
        chainId
        hash
        txHash
        owner
        resolvedOwner
        status
        updatedAtBlock
        additionalData
        schedule: decodedParams
        partOrdersCount
        createdAt: creationDate
      }
      totalCount
    }
  }
`

export const TWAP_PART_ORDERS_QUERY = `
  query TwapPartOrders($chainId: Int!, $parentEventId: String!, $offset: Int! = ${DEFAULT_PAGE_OFFSET}, $limit: Int! = ${DEFAULT_PAGE_LIMIT}, $direction: String! = "${DEFAULT_QUERY_DIRECTION}") {
    partOrders: partOrders(
      where: {
        chainId: $chainId
        conditionalOrderGeneratorId: $parentEventId
      }
      offset: $offset
      limit: $limit
      orderBy: "sortKey"
      orderDirection: $direction
    ) {
      items {
        orderUid
        status
        sellAmount
        buyAmount
        feeAmount
        validTo
        createdAt: creationDate
        executedSellAmount
        executedBuyAmount
        executedFeeAmount: executedFee
      }
      totalCount
    }
  }
`
