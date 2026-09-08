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
        eventId
        chainId
        hash
        owner
        resolvedOwner
        status
        updatedAtBlock
        additionalData
        partOrdersCount
        schedule: decodedParams
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
