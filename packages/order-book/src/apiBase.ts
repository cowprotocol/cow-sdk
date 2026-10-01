import 'cross-fetch/polyfill'
import { RateLimiter } from 'limiter'
import {
  ApiBaseUrls,
  ApiContext,
  DEFAULT_COW_API_CONTEXT,
  PartialApiContext,
  SupportedChainId,
} from '@cowprotocol/sdk-config'
import { jsonWithBigintReplacer, log } from '@cowprotocol/sdk-common'
import { DEFAULT_BACKOFF_OPTIONS, DEFAULT_LIMITER_OPTIONS, FetchParams, request } from './request'

const PROD_BASE_URL = 'https://api.cow.fi'
const STAGING_BASE_URL = 'https://barn.api.cow.fi'
const PARTNER_PROD_BASE_URL = 'https://partners.cow.fi'
const PARTNER_STAGING_BASE_URL = 'https://partners.barn.cow.fi'

/**
 * An object containing *production* environment base URLs for each supported `chainId`.
 * @see {@link https://api.cow.fi/docs/#/}
 */
export const ORDER_BOOK_PROD_CONFIG: ApiBaseUrls = {
  [SupportedChainId.MAINNET]: `${PROD_BASE_URL}/mainnet`,
  [SupportedChainId.GNOSIS_CHAIN]: `${PROD_BASE_URL}/xdai`,
  [SupportedChainId.ARBITRUM_ONE]: `${PROD_BASE_URL}/arbitrum_one`,
  [SupportedChainId.BASE]: `${PROD_BASE_URL}/base`,
  [SupportedChainId.SEPOLIA]: `${PROD_BASE_URL}/sepolia`,
  [SupportedChainId.POLYGON]: `${PROD_BASE_URL}/polygon`,
  [SupportedChainId.AVALANCHE]: `${PROD_BASE_URL}/avalanche`,
  [SupportedChainId.BNB]: `${PROD_BASE_URL}/bnb`,
  [SupportedChainId.LINEA]: `${PROD_BASE_URL}/linea`,
  [SupportedChainId.PLASMA]: `${PROD_BASE_URL}/plasma`,
  [SupportedChainId.INK]: `${PROD_BASE_URL}/ink`,
  [SupportedChainId.SOLANA]: `${PROD_BASE_URL}/solana`,
}

/**
 * An object containing *staging* environment base URLs for each supported `chainId`.
 */
export const ORDER_BOOK_STAGING_CONFIG: ApiBaseUrls = {
  [SupportedChainId.MAINNET]: `${STAGING_BASE_URL}/mainnet`,
  [SupportedChainId.GNOSIS_CHAIN]: `${STAGING_BASE_URL}/xdai`,
  [SupportedChainId.ARBITRUM_ONE]: `${STAGING_BASE_URL}/arbitrum_one`,
  [SupportedChainId.BASE]: `${STAGING_BASE_URL}/base`,
  [SupportedChainId.SEPOLIA]: `${STAGING_BASE_URL}/sepolia`,
  [SupportedChainId.POLYGON]: `${STAGING_BASE_URL}/polygon`,
  [SupportedChainId.AVALANCHE]: `${STAGING_BASE_URL}/avalanche`,
  [SupportedChainId.BNB]: `${STAGING_BASE_URL}/bnb`,
  [SupportedChainId.LINEA]: `${STAGING_BASE_URL}/linea`,
  [SupportedChainId.PLASMA]: `${STAGING_BASE_URL}/plasma`,
  [SupportedChainId.INK]: `${STAGING_BASE_URL}/ink`,
  [SupportedChainId.SOLANA]: `${STAGING_BASE_URL}/solana`,
}

/**
 * An object containing *partner production* environment base URLs for each supported `chainId`.
 * Used when apiKey is set; requests include X-API-Key header.
 * @see {@link https://partners.cow.fi}
 */
export const ORDER_BOOK_PARTNER_PROD_CONFIG: ApiBaseUrls = {
  [SupportedChainId.MAINNET]: `${PARTNER_PROD_BASE_URL}/mainnet`,
  [SupportedChainId.GNOSIS_CHAIN]: `${PARTNER_PROD_BASE_URL}/xdai`,
  [SupportedChainId.ARBITRUM_ONE]: `${PARTNER_PROD_BASE_URL}/arbitrum_one`,
  [SupportedChainId.BASE]: `${PARTNER_PROD_BASE_URL}/base`,
  [SupportedChainId.SEPOLIA]: `${PARTNER_PROD_BASE_URL}/sepolia`,
  [SupportedChainId.POLYGON]: `${PARTNER_PROD_BASE_URL}/polygon`,
  [SupportedChainId.AVALANCHE]: `${PARTNER_PROD_BASE_URL}/avalanche`,
  [SupportedChainId.BNB]: `${PARTNER_PROD_BASE_URL}/bnb`,
  [SupportedChainId.LINEA]: `${PARTNER_PROD_BASE_URL}/linea`,
  [SupportedChainId.PLASMA]: `${PARTNER_PROD_BASE_URL}/plasma`,
  [SupportedChainId.INK]: `${PARTNER_PROD_BASE_URL}/ink`,
  [SupportedChainId.SOLANA]: `${PARTNER_PROD_BASE_URL}/solana`,
}

/**
 * An object containing *partner staging* environment base URLs for each supported `chainId`.
 * Used when apiKey is set and env is staging; requests include X-API-Key header.
 * @see {@link https://partners.barn.cow.fi}
 */
export const ORDER_BOOK_PARTNER_STAGING_CONFIG: ApiBaseUrls = {
  [SupportedChainId.MAINNET]: `${PARTNER_STAGING_BASE_URL}/mainnet`,
  [SupportedChainId.GNOSIS_CHAIN]: `${PARTNER_STAGING_BASE_URL}/xdai`,
  [SupportedChainId.ARBITRUM_ONE]: `${PARTNER_STAGING_BASE_URL}/arbitrum_one`,
  [SupportedChainId.BASE]: `${PARTNER_STAGING_BASE_URL}/base`,
  [SupportedChainId.SEPOLIA]: `${PARTNER_STAGING_BASE_URL}/sepolia`,
  [SupportedChainId.POLYGON]: `${PARTNER_STAGING_BASE_URL}/polygon`,
  [SupportedChainId.AVALANCHE]: `${PARTNER_STAGING_BASE_URL}/avalanche`,
  [SupportedChainId.BNB]: `${PARTNER_STAGING_BASE_URL}/bnb`,
  [SupportedChainId.LINEA]: `${PARTNER_STAGING_BASE_URL}/linea`,
  [SupportedChainId.PLASMA]: `${PARTNER_STAGING_BASE_URL}/plasma`,
  [SupportedChainId.INK]: `${PARTNER_STAGING_BASE_URL}/ink`,
  [SupportedChainId.SOLANA]: `${PARTNER_STAGING_BASE_URL}/solana`,
}

export function cleanObjectFromUndefinedValues(obj: Record<string, string>): typeof obj {
  return Object.keys(obj).reduce(
    (acc, key) => {
      const val = obj[key]
      if (typeof val !== 'undefined') acc[key] = val
      return acc
    },
    {} as typeof obj,
  )
}

/**
 * Shared transport for the order book clients: context merging, base URL selection per environment,
 * rate limiting, backoff and auth headers. Subclasses add the endpoints of the order book they talk to.
 */
export abstract class OrderBookApiBase {
  public context: ApiContext

  private rateLimiter: RateLimiter

  constructor(context: PartialApiContext = {}, defaultContext: ApiContext = DEFAULT_COW_API_CONTEXT) {
    this.context = { ...defaultContext, ...context }
    this.rateLimiter = new RateLimiter(context.limiterOpts || DEFAULT_LIMITER_OPTIONS)
  }

  /**
   * Apply an override to the context for a request.
   * @param contextOverride Optional context override for this request.
   * @returns New context with the override applied.
   */
  protected getContextWithOverride(contextOverride: PartialApiContext = {}): ApiContext {
    return { ...this.context, ...contextOverride }
  }

  /**
   * Get the base URLs for the API endpoints given the context.
   * Uses partner URLs when apiKey is set (and no custom baseUrls override).
   * @param context The merged API context for the request.
   * @returns The base URLs for the API endpoints.
   */
  protected getApiBaseUrls(context: ApiContext): ApiBaseUrls {
    if (context.baseUrls) return context.baseUrls
    if (context.apiKey) {
      return context.env === 'prod' ? ORDER_BOOK_PARTNER_PROD_CONFIG : ORDER_BOOK_PARTNER_STAGING_CONFIG
    }
    return context.env === 'prod' ? ORDER_BOOK_PROD_CONFIG : ORDER_BOOK_STAGING_CONFIG
  }

  /**
   * Make a request to the API.
   * @param params The parameters for the request.
   * @param contextOverride Optional context override for this request.
   * @returns The response from the API.
   */
  protected fetch<T>(params: FetchParams, contextOverride: PartialApiContext = {}): Promise<T> {
    const context = this.getContextWithOverride(contextOverride)
    const { chainId, backoffOpts: _backoffOpts, apiKey, bearerToken } = context
    const baseUrl = this.getApiBaseUrls(context)[chainId]
    const backoffOpts = _backoffOpts || DEFAULT_BACKOFF_OPTIONS
    const rateLimiter = contextOverride.limiterOpts ? new RateLimiter(contextOverride.limiterOpts) : this.rateLimiter
    const additionalHeaders = {
      ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : undefined),
      ...(apiKey ? { 'X-API-Key': apiKey } : undefined),
    }

    log(`Fetching OrderBook API: ${baseUrl}${params.path}. Params: ${JSON.stringify(params, jsonWithBigintReplacer)}`)

    return request(baseUrl, params, rateLimiter, backoffOpts, additionalHeaders)
  }
}
