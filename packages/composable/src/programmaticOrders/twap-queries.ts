const TWAP_PARENT_FIELDS = `
  eventId
  chainId
  hash
  owner
  resolvedOwner
  status
  updatedAtBlock
  additionalData
  schedule: decodedParams
`

export const TWAP_ORDER_QUERY = `
  query TwapOrder($chainId: Float!, $partsChainId: Int!, $eventId: String!) {
    twapOrder: conditionalOrderGenerator(chainId: $chainId, eventId: $eventId) {
      orderType
      ${TWAP_PARENT_FIELDS}
      txHash
      transaction {
        blockTimestamp
      }
    }
    knownParts: partOrders(where: { chainId: $partsChainId, conditionalOrderGeneratorId: $eventId }, limit: 1) {
      totalCount
    }
  }
`

export const TWAP_ORDERS_QUERY = `
  query TwapOrders($resolvedOwner: String!, $chainId: Int!, $offset: Int!, $limit: Int!, $direction: String!, $updatedAtBlockGte: BigInt) {
    twapOrders: programmaticOrders(
      where: {
        chainId: $chainId
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
        ${TWAP_PARENT_FIELDS}
        partOrdersCount
        createdAt: creationDate
      }
      totalCount
    }
  }
`

export const TWAP_PART_ORDERS_QUERY = `
  query TwapPartOrders($chainId: Int!, $parentEventId: String!, $offset: Int!, $limit: Int!, $direction: String!) {
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
