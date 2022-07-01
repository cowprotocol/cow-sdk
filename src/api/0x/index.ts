import { OrderKind } from '@cowprotocol/contracts'
import { SupportedChainId } from '../../constants/chains'
import { Context } from '../../utils/context'

import BaseApi from '../base'

import { PriceInformation, PriceQuoteParams } from '../cow/types'
import { MatchaPriceQuote } from './types'

function getMatchaChainId(chainId: SupportedChainId): SupportedChainId | null {
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

// Defaults
const API_NAME = '0x'

// GPV2Settlement
// https://etherscan.io/address/0x9008d19f58aabd9ed0d60971565aa8510560ab41
const AFFILIATE_ADDRESS = '0x9008D19f58AAbD9eD0D60971565AA8510560ab41'
const EXCLUDED_SOURCES = ''
const MATCHA_DEFAULT_OPTIONS = `affiliateAddress=${AFFILIATE_ADDRESS}&excludedSources=${EXCLUDED_SOURCES}`

export class ZeroXApi extends BaseApi {
  constructor(context: Context) {
    super({ context, name: API_NAME, baseUrl: _get0xUrls(context.isDevEnvironment, API_URL_VERSION) })
  }

  async getQuote(params: PriceQuoteParams): Promise<MatchaPriceQuote | null> {
    const chainId = await this.context.chainId
    const { baseToken, quoteToken, amount, kind } = getValidParams(params)

    const networkId = getMatchaChainId(chainId)
    if (networkId == null) {
      // Unsupported network
      return null
    }

    console.log(`[pricesApi:${API_NAME}] Get price from ${API_NAME}`, params)

    // Buy/sell token and side (sell/buy)
    const { sellToken, buyToken } = getTokensFromMarket({ baseToken, quoteToken, kind })
    const swapSide = kind === OrderKind.BUY ? 'buyAmount' : 'sellAmount'

    const response = await this.fetch(
      `/price?sellToken=${sellToken}&buyToken=${buyToken}&${swapSide}=${amount}&${MATCHA_DEFAULT_OPTIONS}`,
      'GET'
    ).catch((error) => {
      console.error(`Error getting ${API_NAME} price quote:`, error)
      throw new Error(error)
    })

    return response.json()
  }
}

function _get0xUrls(): Partial<Record<SupportedChainId, string>> {
  // Support: Mainnet, Ropsten, Polygon, Binance Smart Chain
  // See https://0x.org/docs/api#introduction
  return {
    [SupportedChainId.MAINNET]: 'https://api.0x.org/swap',
  }
}

export function toPriceInformation(priceRaw: MatchaPriceQuote | null, kind: OrderKind): PriceInformation | null {
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
