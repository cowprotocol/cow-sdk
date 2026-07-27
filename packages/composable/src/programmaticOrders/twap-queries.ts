export const TWAP_ORDERS_QUERY = `
  query TwapOrders($resolvedOwner: String!, $chainId: Int!, $offset: Int!, $limit: Int!, $direction: String!) {
    twapOrders: conditionalOrderGenerators(
      where: {
        chainId: $chainId
        orderType: TWAP
        resolvedOwner: $resolvedOwner
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
        partOrders: discreteOrders(limit: 1) {
          totalCount
        }
        schedule: decodedParams
        transaction {
          blockTimestamp
        }
      }
      totalCount
    }
  }
`

export const TWAP_PART_ORDERS_QUERY = `
  query TwapPartOrders($chainId: Int!, $parentEventId: String!, $offset: Int!, $limit: Int!, $direction: String!) {
    partOrders: discreteOrders(
      where: {
        chainId: $chainId
        conditionalOrderGeneratorId: $parentEventId
      }
      offset: $offset
      limit: $limit
      orderBy: "creationDate"
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
