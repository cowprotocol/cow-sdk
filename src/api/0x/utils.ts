import { OrderKind } from '@cowprotocol/contracts'
import log from 'loglevel'
import { SupportedChainId } from '../../constants/chains'
import { objectToQueryString, CowError } from '../../utils/common'
import { PriceInformation, PriceQuoteParams } from '../cow/types'
import ZeroXError, { ZeroXErrorResponse, logPrefix } from './error'
import { ZeroXOptions, MatchaPriceQuote } from './types'

export function get0xUrls(): Partial<Record<SupportedChainId, string>> {
  // Support: Mainnet, Ropsten, Polygon, Binance Smart Chain
  // See https://0x.org/docs/api#introduction
  return {
    [SupportedChainId.MAINNET]: 'https://api.0x.org/swap',
  }
}

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

export function getMatchaChainId(chainId: SupportedChainId): SupportedChainId | null {
  switch (chainId) {
    // Support: Mainnet, Ropsten, Polygon, Binance Smart Chain
    // See https://0x.org/docs/api#introduction
    // but we only support mainnet of that list so..
    case SupportedChainId.MAINNET:
      return chainId

    default:
      // Unsupported network
      return null
  }
}

export function optionsToMatchaParamsUrl({
  excludedSources,
  affiliateAddress,
}: {
  excludedSources: ZeroXOptions['excludedSources']
  affiliateAddress: string
}): string {
  const excludedSourceString = extractExcludedSources({ excludedSources })

  return objectToQueryString({ excludedSources: excludedSourceString, affiliateAddress })
}

export async function handleQuoteResponse<T = unknown, P extends PriceQuoteParams = PriceQuoteParams>(
  response: Response,
  params?: P
): Promise<T> {
  if (!response.ok) {
    const errorObj: ZeroXErrorResponse = await response.clone().json()

    let priceError
    if (errorObj?.code && errorObj?.reason) {
      priceError = new ZeroXError(errorObj)
    } else {
      const errorMessage = await ZeroXError.getErrorFromStatusCode(response.clone())
      priceError = new ZeroXError({ code: response.status, reason: errorMessage })
    }

    if (params) {
      const { quoteToken, baseToken } = params
      log.error(logPrefix, `Error querying fee from API - quoteToken: ${quoteToken}, baseToken: ${baseToken}`)
    }

    throw priceError
  } else {
    return response.json()
  }
}

export function throwOrReturnAffiliateAddress({
  affiliateAddressMap,
  chainId,
}: {
  affiliateAddressMap: ZeroXOptions['affiliateAddressMap']
  chainId: SupportedChainId
}): string {
  const affiliateAddress = affiliateAddressMap[chainId]
  if (!affiliateAddress) {
    throw _getMissingAffiliateAddressError({ affiliateAddressMap, chainId })
  }

  return affiliateAddress
}

export function extractExcludedSources({ excludedSources }: Pick<ZeroXOptions, 'excludedSources'>) {
  return excludedSources.length > 0 ? excludedSources.join(',') : ''
}

function _getMissingAffiliateAddressError(params: Record<string, unknown>): CowError {
  return new CowError(`Invalid affiliate address! Parameters passed: ${JSON.stringify(params, null, 2)}`)
}
