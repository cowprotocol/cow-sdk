import { OrderKind } from '@cowprotocol/contracts'
import { SupportedChainId as ChainId } from '../../constants/chains'
import { Context } from '../../utils/context'
import { getValidParams } from '../../utils/price'
import { getTokensFromMarket } from '../../utils/tokens'
import BaseApi from '../base'
import { PriceInformation, PriceQuoteParams } from '../cow/types'
import { ZeroXPriceQuote } from './types'

function _get0xChainId(chainId: ChainId): ChainId | null {
  if (!ENABLED) {
    return null
  }

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

function _getApiUrl(): Record<ChainId, string> {
  // Support: Mainnet, Ropsten, Polygon, Binance Smart Chain
  // See https://0x.org/docs/api#introduction
  return {
    [ChainId.MAINNET]: 'https://api.0x.org/swap',
    [ChainId.RINKEBY]: 'https://api.0x.org/swap',
    [ChainId.GNOSIS_CHAIN]: 'https://api.0x.org/swap',
  }
}

// Defaults
const API_NAME = '0x'
const ENABLED = process.env.REACT_APP_PRICE_FEED_0X_ENABLED !== 'false'
const API_BASE_URL = _getApiUrl()
const API_VERSION = 'v1'
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
}
// GPV2Settlement
// https://etherscan.io/address/0x9008d19f58aabd9ed0d60971565aa8510560ab41
const AFFILIATE_ADDRESS = '0x9008D19f58AAbD9eD0D60971565AA8510560ab41'
const EXCLUDED_SOURCES = ''
const ZEROX_DEFAULT_OPTIONS = `affiliateAddress=${AFFILIATE_ADDRESS}&excludedSources=${EXCLUDED_SOURCES}`

function _getApiBaseUrl(chainId: ChainId): string {
  const baseUrl = API_BASE_URL[chainId]

  if (!baseUrl) {
    throw new Error(`Unsupported Network. The ${API_NAME} API is not deployed in the Network ${chainId}`)
  } else {
    return baseUrl + '/' + API_VERSION
  }
}

function _fetch(chainId: ChainId, url: string, method: 'GET' | 'POST' | 'DELETE', data?: any): Promise<Response> {
  const baseUrl = _getApiBaseUrl(chainId)
  return fetch(baseUrl + url, {
    headers: DEFAULT_HEADERS,
    method,
    body: data !== undefined ? JSON.stringify(data) : data,
  })
}

// TODO: consider making these _get/_delete/_post etc reusable across apis
function _get(chainId: ChainId, url: string): Promise<Response> {
  return _fetch(chainId, url, 'GET')
}

export async function getPriceQuote(params: PriceQuoteParams): Promise<ZeroXPriceQuote | null> {
  const { baseToken, quoteToken, amount, kind, chainId } = getValidParams(params)

  const networkId = _get0xChainId(chainId)
  if (networkId == null) {
    // Unsupported network
    return null
  }

  console.log(`[pricesApi:${API_NAME}] Get price from ${API_NAME}`, params)

  // Buy/sell token and side (sell/buy)
  const { sellToken, buyToken } = getTokensFromMarket({ baseToken, quoteToken, kind })
  const swapSide = kind === OrderKind.BUY ? 'buyAmount' : 'sellAmount'

  const response = await _get(
    chainId,
    `/price?sellToken=${sellToken}&buyToken=${buyToken}&${swapSide}=${amount}&${ZEROX_DEFAULT_OPTIONS}`
  ).catch((error) => {
    console.error(`Error getting ${API_NAME} price quote:`, error)
    throw new Error(error)
  })

  return response.json()
}

export function toPriceInformation(priceRaw: ZeroXPriceQuote | null, kind: OrderKind): PriceInformation | null {
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

export class ZeroXApi extends BaseApi {
  constructor(context: Context) {
    super({ context, name: API_NAME, baseUrl: API_BASE_URL })
  }

  async getProfileData(address: string): Promise<ProfileData | null> {
    const chainId = await this.context.chainId
    log.debug(logPrefix, `[api:${this.API_NAME}] Get profile data for`, chainId, address)
    if (chainId !== ChainId.MAINNET) {
      log.info(logPrefix, 'Profile data is only available for mainnet')
      return null
    }

    const response = await this._getProfile(`/profile/${address}`)

    if (!response.ok) {
      const errorResponse = await response.json()
      log.error(logPrefix, errorResponse)
      throw new CowError(errorResponse?.description)
    } else {
      return response.json()
    }
  }
}
