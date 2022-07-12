import { OrderKind } from '@cowprotocol/contracts'
import log from 'loglevel'
import { SupportedChainId } from '../../constants/chains'
import { Context } from '../../utils/context'
import { getTokensFromMarket } from '../../utils/market'
import { toErc20Address } from '../../utils/tokens'

import BaseApi from '../base'

import { Options, PriceQuoteParams } from '../cow/types'
import ZeroXError, { logPrefix, ZeroXErrorResponse } from './error'
import { ERC20BridgeSource, MatchaOptions, MatchaPriceQuote } from './types'

// GPV2Settlement
// https://etherscan.io/address/0x9008d19f58aabd9ed0d60971565aa8510560ab41
const AFFILIATE_ADDRESS = '0x9008D19f58AAbD9eD0D60971565AA8510560ab41'
const EXCLUDED_SOURCES: ERC20BridgeSource[] = []
const API_VERSION = 'v1'

function get0xUrls(): Partial<Record<SupportedChainId, string>> {
  // Support: Mainnet, Ropsten, Polygon, Binance Smart Chain
  // See https://0x.org/docs/api#introduction
  return {
    [SupportedChainId.MAINNET]: 'https://api.0x.org/swap',
  }
}

function _getMatchaChainId(chainId: SupportedChainId): SupportedChainId | null {
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

function _optionsToSearchUrl(options: MatchaOptions) {
  const { excludedSources, affiliateAddress } = options

  const excludedSourceString = excludedSources.length > 0 ? excludedSources.join(',') : ''
  const optionsMap = Object.entries({ excludedSources: excludedSourceString, affiliateAddress }).map(
    ([option, value]) => `${option}=${value}`
  )
  return optionsMap.join('&')
}

async function _handleQuoteResponse<T = unknown, P extends PriceQuoteParams = PriceQuoteParams>(
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

export class ZeroXApi extends BaseApi {
  MATCHA_OPTIONS
  MATCHA_OPTIONS_URL

  constructor(
    context: Context,
    matchaOptions: MatchaOptions = { affiliateAddress: AFFILIATE_ADDRESS, excludedSources: EXCLUDED_SOURCES }
  ) {
    super({ context, name: '0x', apiVersion: API_VERSION, getApiUrl: get0xUrls })
    this.MATCHA_OPTIONS = matchaOptions
    this.MATCHA_OPTIONS_URL = _optionsToSearchUrl(matchaOptions)
  }

  async getQuote(params: PriceQuoteParams, options: Options = {}): Promise<MatchaPriceQuote | null> {
    const { amount, baseToken, quoteToken, kind } = params
    const { chainId: customChainId, isDevEnvironment = this.context.isDevEnvironment } = options
    const chainId = customChainId || (await this.context.chainId)
    // this is handled via an error on L51 via the fetch call
    // but we can handle it here to control the flow better
    const networkId = _getMatchaChainId(chainId)
    if (networkId == null) {
      log.debug('[0x API] - Network not supported')
      // Unsupported network
      return null
    }

    log.debug(`[0x API] Get price from ${this.API_NAME}`, params, this.MATCHA_OPTIONS)

    // Buy/sell token and side (sell/buy)
    const { sellToken, buyToken } = getTokensFromMarket({
      baseToken: toErc20Address(baseToken, chainId),
      quoteToken: toErc20Address(quoteToken, chainId),
      kind,
    })
    const swapSide = kind === OrderKind.BUY ? 'buyAmount' : 'sellAmount'
    const response = await this.get(
      `/price?sellToken=${sellToken}&buyToken=${buyToken}&${swapSide}=${amount}&${this.MATCHA_OPTIONS_URL}`,
      { chainId, isDevEnvironment }
    ).catch((error) => {
      log.error(`Error getting ${this.API_NAME} price quote:`, error)
      throw new Error(error)
    })

    return _handleQuoteResponse(response)
  }

  public updateOptions({ affiliateAddress, excludedSources }: Partial<MatchaOptions>) {
    if (affiliateAddress) {
      log.debug('0xApi::Updating 0x affiliate address to', affiliateAddress)
      this.MATCHA_OPTIONS.affiliateAddress = affiliateAddress
    }
    if (excludedSources) {
      log.debug('0xApi::Updating 0x affiliate exlcudedSources to', excludedSources)
      this.MATCHA_OPTIONS.excludedSources = excludedSources
    }

    this.MATCHA_OPTIONS_URL = _optionsToSearchUrl(this.MATCHA_OPTIONS)
  }
}
