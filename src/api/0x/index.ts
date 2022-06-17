import { OrderKind } from '@cowprotocol/contracts'
import log from 'loglevel'
import { SupportedChainId as ChainId } from '../../constants/chains'
import { Context } from '../../utils/context'
import { getValidParams } from '../../utils/price'
import { getTokensFromMarket } from '../../utils/tokens'
import BaseApi from '../base'
import { PriceInformation, PriceQuoteParams } from '../cow/types'
import { ZeroXPriceQuote } from './types'

function _getApiUrl(version = API_VERSION): Partial<Record<ChainId, string>> {
  // Support: Mainnet, Ropsten, Polygon, Binance Smart Chain
  // See https://0x.org/docs/api#introduction
  return {
    [ChainId.MAINNET]: 'https://api.0x.org/swap/' + version,
  }
}

// Syntactic sugar for syncing quote response types to PriceInformation
function _normaliseQuoteResponse(priceRaw: ZeroXPriceQuote | null, kind: OrderKind): PriceInformation | null {
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

// Defaults
const API_NAME = '0x'
const API_VERSION = 'v1'

// GPV2Settlement
// https://etherscan.io/address/0x9008d19f58aabd9ed0d60971565aa8510560ab41
const AFFILIATE_ADDRESS = '0x9008D19f58AAbD9eD0D60971565AA8510560ab41'
const EXCLUDED_SOURCES = ''
// options: https://docs.0x.org/0x-api-swap/api-references/get-swap-v1-price
const ZEROX_DEFAULT_OPTIONS = `affiliateAddress=${AFFILIATE_ADDRESS}&excludedSources=${EXCLUDED_SOURCES}`

export class ZeroXApi extends BaseApi {
  constructor(context: Context) {
    super({ context, name: API_NAME, baseUrl: _getApiUrl(API_VERSION) })
  }

  public async getQuote(params: PriceQuoteParams): Promise<PriceInformation | null> {
    const chainId = await this.context.chainId
    const { baseToken, quoteToken, amount, kind } = getValidParams(Object.assign({ chainId }, params))

    const networkId = this._get0xChainId()
    if (networkId == null) {
      // Unsupported network
      return null
    }

    log.debug(`[pricesApi:${API_NAME}] Get price from ${API_NAME}`, params)

    // Buy/sell token and side (sell/buy)
    const { sellToken, buyToken } = getTokensFromMarket({ baseToken, quoteToken, kind })
    const swapSide = kind === OrderKind.BUY ? 'buyAmount' : 'sellAmount'

    const response = await this.get(
      `/price?sellToken=${sellToken}&buyToken=${buyToken}&${swapSide}=${amount}&${ZEROX_DEFAULT_OPTIONS}`
    ).catch((error) => {
      log.error(`Error getting ${API_NAME} price quote:`, error)
      throw new Error(error)
    })

    const zeroXResponse = await response.json()
    return _normaliseQuoteResponse(zeroXResponse, kind)
  }

  private async _get0xChainId() {
    const chainId = await this.context.chainId
    switch (chainId) {
      // Support: Mainnet, Ropsten, Polygon, Binance Smart Chain
      // See https://0x.org/docs/api#introduction
      // but we only support mainnet of that list so..
      case ChainId.MAINNET:
        return chainId

      default:
        // Unsupported network
        return null
    }
  }
}
