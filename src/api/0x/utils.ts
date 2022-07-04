import { OrderKind } from '@cowprotocol/contracts'
import { PriceInformation } from '../cow/types'
import { MatchaPriceQuote } from './types'

export function normaliseQuoteResponse(priceRaw: MatchaPriceQuote | null, kind: OrderKind): PriceInformation | null {
  if (!priceRaw || !priceRaw.price) {
    return null
  }

  const { sellAmount, buyAmount, sellTokenAddress, buyTokenAddress } = priceRaw

  if (kind === OrderKind.BUY) {
    return { amount: sellAmount, token: sellTokenAddress }
  } else {
    return { amount: buyAmount, token: buyTokenAddress }
  }
}
