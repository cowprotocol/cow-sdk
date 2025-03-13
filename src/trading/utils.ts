import { LimitTradeParametersFromQuote, PrivateKey, TradeParameters } from './types'
import { OrderQuoteResponse, QuoteAmountsAndCosts } from '../order-book'
import { ETH_ADDRESS, SupportedChainId, WRAPPED_NATIVE_CURRENCIES } from '../common'
import { ethers, Signer } from 'ethers'
import { type ExternalProvider, Web3Provider } from '@ethersproject/providers'
import { ETH_FLOW_DEFAULT_SLIPPAGE_BPS } from './consts'

export function swapParamsToLimitOrderParams(
  params: TradeParameters,
  quoteResponse: OrderQuoteResponse
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

export function getSigner(signer: Signer | ExternalProvider | PrivateKey): Signer {
  if (typeof signer === 'string') return new ethers.Wallet(signer)

  if ('request' in signer || 'send' in signer) {
    const provider = new Web3Provider(signer)

    return provider.getSigner()
  }

  return signer as Signer
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
  mapper: (value: T) => R
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
  orderParameters,
}: {
  quoteParameters: TradeParameters
  orderParameters: TradeParameters
}): TradeParameters {
  return { ...quoteParameters, sellToken: orderParameters.sellToken }
}

/**
 * ETH-flow orders are special and need to be adjusted
 * 1. Sell token should be the wrapped native currency
 * 2. Default slippage is 2%
 */
export function adjustEthFlowOrderParams(
  chainId: SupportedChainId,
  params: TradeParameters | LimitTradeParametersFromQuote
): typeof params {
  return {
    ...params,
    sellToken: WRAPPED_NATIVE_CURRENCIES[chainId].address,
    slippageBps: typeof params.slippageBps === 'number' ? params.slippageBps : ETH_FLOW_DEFAULT_SLIPPAGE_BPS[chainId],
  }
}
