import { SupportedChainId } from '../../constants/chains'
import { ParaswapPriceQuoteParams } from './types'
import { toErc20Address } from '../../utils/tokens'
import { OptimalRate } from 'paraswap-core'
import { APIError, NetworkID } from 'paraswap'

export function getValidParams(chainId: SupportedChainId, params: ParaswapPriceQuoteParams) {
  const { baseToken: baseTokenAux, quoteToken: quoteTokenAux, userAddress } = params
  const baseToken = toErc20Address(baseTokenAux, chainId)
  const quoteToken = toErc20Address(quoteTokenAux, chainId)

  return { ...params, baseToken, quoteToken, userAddress: userAddress ?? undefined }
}

export function isGetRateSuccess(rateResult: OptimalRate | APIError): rateResult is OptimalRate {
  return !!(rateResult as OptimalRate).destAmount
}

export function getPriceQuoteFromError(error: APIError): OptimalRate | null {
  if (error.message === 'ESTIMATED_LOSS_GREATER_THAN_MAX_IMPACT' && error.data && error.data.priceRoute) {
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
