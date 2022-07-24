import { OrderKind } from '@cowprotocol/contracts'
import log from 'loglevel'
import { GP_SETTLEMENT_CONTRACT_ADDRESS } from '../../constants'
import { SupportedChainId } from '../../constants/chains'
import { objectToQueryString } from '../../utils/common'
import { Context } from '../../utils/context'
import { getTokensFromMarket } from '../../utils/market'
import { toErc20Address } from '../../utils/tokens'

import BaseApi from '../base'

import { Options, PriceQuoteLegacyParams } from '../cow/types'
import { logPrefix } from './error'
import { ERC20BridgeSource, ZeroXOptions, MatchaPriceQuote } from './types'
import {
  throwOrReturnAffiliateAddress,
  optionsToMatchaParamsUrl,
  extractExcludedSources,
  handleQuoteResponse,
  getMatchaChainId,
  get0xUrls,
} from './utils'

const EXCLUDED_SOURCES: ERC20BridgeSource[] = []
const API_VERSION = 'v1'

export class ZeroXApi extends BaseApi {
  ZEROX_OPTIONS: ZeroXOptions
  ZEROX_OPTIONS_URL: string

  constructor(chainId: SupportedChainId, options: Partial<ZeroXOptions> | undefined) {
    super({ context: new Context(chainId, {}), name: '0x', apiVersion: API_VERSION, getApiUrl: get0xUrls })

    // get defaults if necessary
    const affiliateAddressMap = options?.affiliateAddressMap || GP_SETTLEMENT_CONTRACT_ADDRESS
    const excludedSources = options?.excludedSources || EXCLUDED_SOURCES
    // checks if missing affiliate address from address map and throws if undefined else returns address string
    const affiliateAddress = throwOrReturnAffiliateAddress({
      affiliateAddressMap,
      chainId,
    })

    this.ZEROX_OPTIONS = { affiliateAddressMap, excludedSources }
    this.ZEROX_OPTIONS_URL = optionsToMatchaParamsUrl({
      excludedSources: excludedSources,
      affiliateAddress,
    })
  }

  async getQuote(params: PriceQuoteLegacyParams, options: Options = {}): Promise<MatchaPriceQuote | null> {
    const { amount, baseToken, quoteToken, kind } = params
    const { chainId: customChainId, env = this.context.env } = options
    const chainId = customChainId || (await this.context.chainId)
    // this is handled via an error on L51 via the fetch call
    // but we can handle it here to control the flow better
    const networkId = getMatchaChainId(chainId)
    if (networkId == null) {
      log.debug(logPrefix, 'Network not supported')
      // Unsupported network
      return null
    }

    log.debug(logPrefix, `Get price from ${this.API_NAME}`, params, this.ZEROX_OPTIONS)

    // Buy/sell token and side (sell/buy)
    const { sellToken, buyToken } = getTokensFromMarket({
      baseToken: toErc20Address(baseToken, chainId),
      quoteToken: toErc20Address(quoteToken, chainId),
      kind,
    })
    const affiliateAddress = throwOrReturnAffiliateAddress({
      affiliateAddressMap: this.ZEROX_OPTIONS.affiliateAddressMap,
      chainId,
    })
    const swapSide = kind === OrderKind.BUY ? 'buyAmount' : 'sellAmount'
    const response = await this.get(
      `/price${objectToQueryString({
        sellToken,
        buyToken,
        [swapSide]: amount,
        affiliateAddress,
        excludedSources: extractExcludedSources(this.ZEROX_OPTIONS),
      })}`,
      { chainId, env }
    ).catch((error) => {
      log.error(`Error getting ${this.API_NAME} price quote:`, error)
      throw new Error(error)
    })

    return handleQuoteResponse(response)
  }

  public async updateOptions({ affiliateAddressMap, excludedSources }: Partial<ZeroXOptions>) {
    const chainId = await this.context.chainId

    if (affiliateAddressMap) {
      log.debug(logPrefix, 'Updating 0x options affiliate address to', affiliateAddressMap)
      this.ZEROX_OPTIONS.affiliateAddressMap = affiliateAddressMap
    }
    if (excludedSources) {
      log.debug(logPrefix, 'Updating 0x options excludedSources to', excludedSources)
      this.ZEROX_OPTIONS.excludedSources = excludedSources
    }

    const affiliateAddress = throwOrReturnAffiliateAddress({
      affiliateAddressMap: this.ZEROX_OPTIONS.affiliateAddressMap,
      chainId,
    })

    this.ZEROX_OPTIONS_URL = optionsToMatchaParamsUrl({
      ...this.ZEROX_OPTIONS,
      affiliateAddress,
    })
  }
}
