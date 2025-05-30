import { LimitTradeParametersFromQuote, TradeParameters } from '../types'
import { OrderQuoteResponse, QuoteAmountsAndCosts } from '../../order-book'
import { ETH_ADDRESS } from '../../common'

export function swapParamsToLimitOrderParams(
  params: TradeParameters,
  quoteResponse: OrderQuoteResponse,
): LimitTradeParametersFromQuote {
  return {
    ...params,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    quoteId: quoteResponse.id!,
    sellAmount: quoteResponse.quote.sellAmount,
    buyAmount: quoteResponse.quote.buyAmount,
  }
}

export function getIsEthFlowOrder(params: { sellToken: string }): boolean {
  return params.sellToken.toLowerCase() === ETH_ADDRESS.toLowerCase()
}

/**
 * Returns the gas value plus a margin for unexpected or variable gas costs (20%)
 * @param value the gas value to pad
 */
export function calculateGasMargin(value: bigint): bigint {
  return value + (value * BigInt(20)) / BigInt(100)
}

export function mapQuoteAmountsAndCosts<T, R>(
  value: QuoteAmountsAndCosts<T>,
  mapper: (value: T) => R,
): QuoteAmountsAndCosts<R> {
  const {
    costs: { networkFee, partnerFee },
  } = value

  function serializeAmounts(value: { sellAmount: T; buyAmount: T }): { sellAmount: R; buyAmount: R } {
    return {
      sellAmount: mapper(value.sellAmount),
      buyAmount: mapper(value.buyAmount),
    }
  }

  return {
    ...value,
    costs: {
      ...value.costs,
      networkFee: {
        ...networkFee,
        amountInSellCurrency: mapper(networkFee.amountInSellCurrency),
        amountInBuyCurrency: mapper(networkFee.amountInBuyCurrency),
      },
      partnerFee: {
        ...partnerFee,
        amount: mapper(partnerFee.amount),
      },
    },
    beforeNetworkCosts: serializeAmounts(value.beforeNetworkCosts),
    afterNetworkCosts: serializeAmounts(value.afterNetworkCosts),
    afterPartnerFees: serializeAmounts(value.afterPartnerFees),
    afterSlippage: serializeAmounts(value.afterSlippage),
  }
}

/**
 * Set sell token to the initial one
 * Because for ETH-flow orders we do quote requests with wrapped token
 */
export function getTradeParametersAfterQuote({
  quoteParameters,
  sellToken,
}: {
  quoteParameters: TradeParameters
  sellToken: string
}): TradeParameters {
  return { ...quoteParameters, sellToken }
}
