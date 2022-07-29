import { SupportedChainId } from '../../constants/chains'
import { ParaswapPriceQuoteParams } from './types'
import { toErc20Address } from '../../utils/tokens'
import { OptimalRate, SwapSide } from 'paraswap-core'
import { APIError, NetworkID } from 'paraswap'
import ParaswapError from './error'
import { PriceInformation } from '../../types'

export function getValidParams(chainId: SupportedChainId, params: ParaswapPriceQuoteParams) {
  const { baseToken: baseTokenAux, quoteToken: quoteTokenAux, userAddress } = params
  const baseToken = toErc20Address(baseTokenAux, chainId)
  const quoteToken = toErc20Address(quoteTokenAux, chainId)

  return { ...params, baseToken, quoteToken, userAddress: userAddress ?? undefined }
}

export function isGetRateSuccess(rateResult: OptimalRate | APIError): rateResult is OptimalRate {
  return !!(rateResult as OptimalRate)?.destAmount
}

export function getPriceQuoteFromError(error: APIError): OptimalRate | null {
  if (error?.message === 'ESTIMATED_LOSS_GREATER_THAN_MAX_IMPACT' && error.data && error.data.priceRoute) {
    // If the price impact is too big, it still give you the estimation
    return error.data.priceRoute
  } else {
    return null
  }
}

// ParaSwap supported: MAINNET, ROPSTEN, BSC, POLYGON, AVALANCHE C, FANTOM OPERA, ARBITRUM ONE
export function getParaswapChainId(chainId: SupportedChainId): NetworkID | null {
  switch (chainId) {
    case SupportedChainId.MAINNET:
      // case SupportedChainId.POLYGON:
      return chainId as NetworkID

    default:
      // Unsupported network
      return null
  }
}

export function handleResponse(rateResult: OptimalRate | APIError) {
  if (isGetRateSuccess(rateResult)) {
    // Success getting the price
    return rateResult
  } else {
    // Error getting the price
    const priceQuote = getPriceQuoteFromError(rateResult)
    if (priceQuote) {
      return priceQuote
    } else {
      throw new ParaswapError(rateResult)
    }
  }
}

export function normaliseQuoteResponse(priceRaw: OptimalRate | null): PriceInformation | null {
  if (!priceRaw) {
    return null
  }

  const { destAmount, srcAmount, srcToken, destToken, side } = priceRaw
  if (side === SwapSide.SELL) {
    return {
      amount: destAmount,
      token: destToken,
    }
  } else {
    return {
      amount: srcAmount,
      token: srcToken,
    }
  }
}
