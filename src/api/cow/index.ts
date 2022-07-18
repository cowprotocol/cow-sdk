import log from 'loglevel'
import fetch from 'cross-fetch'
import { OrderKind, QuoteQuery } from '@cowprotocol/contracts'
import { SupportedChainId as ChainId } from '../../constants/chains'
import { getSigningSchemeApiValue, OrderCreation } from '../../utils/sign'
import OperatorError, { ApiErrorCodeDetails, ApiErrorCodes, ApiErrorObject } from './errors/OperatorError'
import QuoteError, {
  GpQuoteErrorCodes,
  GpQuoteErrorObject,
  mapOperatorErrorToQuoteError,
  GpQuoteErrorDetails,
} from './errors/QuoteError'
import { toErc20Address } from '../../utils/tokens'
import { FeeQuoteParams, PriceInformation, PriceQuoteParams, SimpleGetQuoteResponse } from './types'

import { ZERO_ADDRESS } from '../../constants'
import {
  GetOrdersParams,
  GetTradesParams,
  OrderCancellationParams,
  OrderID,
  OrderMetaData,
  ProfileData,
  TradeMetaData,
  Options,
} from './types'
import { CowError, logPrefix, objectToQueryString } from '../../utils/common'
import { Context, Env } from '../../utils/context'
import BaseApi from '../base'

const API_URL_VERSION = 'v1'

function getCowProtocolUrl(env: Env): Partial<Record<ChainId, string>> {
  switch (env) {
    case 'staging':
      return {
        [ChainId.MAINNET]: 'https://barn.api.cow.fi/mainnet/api',
        [ChainId.RINKEBY]: 'https://barn.api.cow.fi/rinkeby/api',
        [ChainId.GOERLI]: 'https://barn.api.cow.fi/goerli/api',
        [ChainId.GNOSIS_CHAIN]: 'https://barn.api.cow.fi/xdai/api',
      }
    case 'prod':
      return {
        [ChainId.MAINNET]: 'https://api.cow.fi/mainnet/api',
        [ChainId.RINKEBY]: 'https://api.cow.fi/rinkeby/api',
        [ChainId.GOERLI]: 'https://api.cow.fi/goerli/api',
        [ChainId.GNOSIS_CHAIN]: 'https://api.cow.fi/xdai/api',
      }
  }
}

function getProfileUrl(env: Env): Partial<Record<ChainId, string>> {
  switch (env) {
    case 'staging':
      return {
        [ChainId.MAINNET]: 'https://barn.api.cow.fi/affiliate/api',
      }
    case 'prod':
      return {
        [ChainId.MAINNET]: 'https://api.cow.fi/affiliate/api',
      }
  }
}

const UNHANDLED_QUOTE_ERROR: GpQuoteErrorObject = {
  errorType: GpQuoteErrorCodes.UNHANDLED_ERROR,
  description: GpQuoteErrorDetails.UNHANDLED_ERROR,
}

const UNHANDLED_ORDER_ERROR: ApiErrorObject = {
  errorType: ApiErrorCodes.UNHANDLED_CREATE_ERROR,
  description: ApiErrorCodeDetails.UNHANDLED_CREATE_ERROR,
}

async function _handleQuoteResponse<T = unknown, P extends QuoteQuery = QuoteQuery>(
  response: Response,
  params?: P
): Promise<T> {
  if (!response.ok) {
    const errorObj: ApiErrorObject = await response.json()

    // we need to map the backend error codes to match our own for quotes
    const mappedError = mapOperatorErrorToQuoteError(errorObj)
    const quoteError = new QuoteError(mappedError)

    if (params) {
      const { sellToken, buyToken } = params
      log.error(logPrefix, `Error querying fee from API - sellToken: ${sellToken}, buyToken: ${buyToken}`)
    }

    throw quoteError
  } else {
    return response.json()
  }
}

export class CowApi extends BaseApi {
  constructor(context: Context) {
    this.context = context
  }

  get DEFAULT_HEADERS() {
    return { 'Content-Type': 'application/json', 'X-AppId': this.context.appDataHash }
  }

  get API_BASE_URL() {
    return getCowProtocolUrl(this.context.env)
    super({ context, name: 'CoW Protocol', apiVersion: API_URL_VERSION, getApiUrl: getGnosisProtocolUrl })
  }

  async getProfileData(address: string, options: Options = {}): Promise<ProfileData | null> {
    const { chainId: networkId, env } = options
    const chainId = networkId || (await this.context.chainId)
    log.debug(logPrefix, `[api:${this.API_NAME}] Get profile data for`, chainId, address)
    if (chainId !== ChainId.MAINNET) {
      log.info(logPrefix, 'Profile data is only available for mainnet')
      return null
    }

    const response = await this.getProfile(`/profile/${address}`, { chainId, env })

    if (!response.ok) {
      const errorResponse = await response.json()
      log.error(logPrefix, errorResponse)
      throw new CowError(errorResponse?.description)
    } else {
      return response.json()
    }
  }

  async getTrades(params: GetTradesParams, options: Options = {}): Promise<TradeMetaData[]> {
    const { chainId: networkId, env = this.context.env } = options
    const { owner, orderId, limit, offset } = params
    if (owner && orderId) {
      throw new CowError('Cannot specify both owner and orderId')
    }
    const qsParams = objectToQueryString({ owner, orderUid: orderId, limit, offset })
    const chainId = networkId || (await this.context.chainId)
    log.debug(logPrefix, '[util:operator] Get trades for', chainId, { owner, orderId, limit, offset })
    try {
      const response = await this.get(`/trades${qsParams}`, { chainId, env })

      if (!response.ok) {
        const errorResponse = await response.json()
        throw new OperatorError(errorResponse)
      } else {
        return response.json()
      }
    } catch (error) {
      log.error(logPrefix, 'Error getting trades:', error)
      if (error instanceof OperatorError) throw error

      throw new CowError('Error getting trades: ' + error)
    }
  }

  async getOrders(params: GetOrdersParams, options: Options = {}): Promise<OrderMetaData[]> {
    const { chainId: networkId, env = this.context.env } = options
    const { owner, limit = 1000, offset = 0 } = params
    const queryString = objectToQueryString({ limit, offset })
    const chainId = networkId || (await this.context.chainId)
    log.debug(logPrefix, `[api:${this.API_NAME}] Get orders for `, chainId, owner, limit, offset)

    try {
      const response = await this.get(`/account/${owner}/orders/${queryString}`, { chainId, env })

      if (!response.ok) {
        const errorResponse: ApiErrorObject = await response.json()
        throw new OperatorError(errorResponse)
      } else {
        return response.json()
      }
    } catch (error) {
      log.error(logPrefix, 'Error getting orders information:', error)
      if (error instanceof OperatorError) throw error

      throw new OperatorError(UNHANDLED_ORDER_ERROR)
    }
  }

  async getTxOrders(txHash: string, options: Options = {}): Promise<OrderMetaData[]> {
    const { chainId: networkId, env } = options
    const chainId = networkId || (await this.context.chainId)
    log.debug(`[api:${this.API_NAME}] Get tx orders for `, chainId, txHash)

    try {
      const response = await this.get(`/transactions/${txHash}/orders`, { chainId, env })

      if (!response.ok) {
        const errorResponse: ApiErrorObject = await response.json()
        throw new OperatorError(errorResponse)
      } else {
        return response.json()
      }
    } catch (error) {
      log.error('Error getting transaction orders information:', error)
      if (error instanceof OperatorError) throw error
      throw new OperatorError(UNHANDLED_ORDER_ERROR)
    }
  }

  async getOrder(orderId: string, options: Options = {}): Promise<OrderMetaData | null> {
    const { chainId: networkId, env } = options
    const chainId = networkId || (await this.context.chainId)
    log.debug(logPrefix, `[api:${this.API_NAME}] Get order for `, chainId, orderId)
    try {
      const response = await this.get(`/orders/${orderId}`, { chainId, env })

      if (!response.ok) {
        const errorResponse: ApiErrorObject = await response.json()
        throw new OperatorError(errorResponse)
      } else {
        return response.json()
      }
    } catch (error) {
      log.error(logPrefix, 'Error getting order information:', error)
      if (error instanceof OperatorError) throw error

      throw new OperatorError(UNHANDLED_ORDER_ERROR)
    }
  }

  async getPriceQuoteLegacy(params: PriceQuoteParams, options: Options = {}): Promise<PriceInformation | null> {
    const { chainId: networkId, env } = options
    const { baseToken, quoteToken, amount, kind } = params
    const chainId = networkId || (await this.context.chainId)
    log.debug(logPrefix, `[api:${this.API_NAME}] Get price from API`, params, 'for', chainId)

    const response = await this.get(
      `/markets/${toErc20Address(baseToken, chainId)}-${toErc20Address(quoteToken, chainId)}/${kind}/${amount}`,
      { chainId, env }
    ).catch((error) => {
      log.error(logPrefix, 'Error getting price quote:', error)
      throw new QuoteError(UNHANDLED_QUOTE_ERROR)
    })

    return _handleQuoteResponse<PriceInformation | null>(response)
  }

  async getQuote(params: FeeQuoteParams, options: Options = {}): Promise<SimpleGetQuoteResponse> {
    const { chainId: networkId, env } = options
    const chainId = networkId || (await this.context.chainId)
    const quoteParams = this.mapNewToLegacyParams(params, chainId)
    const response = await this.post('/quote', quoteParams, { chainId, env })

    return _handleQuoteResponse<SimpleGetQuoteResponse>(response)
  }

  async sendSignedOrderCancellation(params: OrderCancellationParams, options: Options = {}): Promise<void> {
    const { chainId: networkId, env } = options
    const { cancellation, owner: from } = params
    const chainId = networkId || (await this.context.chainId)
    log.debug(logPrefix, `[api:${this.API_NAME}] Delete signed order for network`, chainId, cancellation)

    const response = await this.delete(
      `/orders/${cancellation.orderUid}`,
      {
        signature: cancellation.signature,
        signingScheme: getSigningSchemeApiValue(cancellation.signingScheme),
        from,
      },
      { chainId, env }
    )

    if (!response.ok) {
      // Raise an exception
      const errorMessage = await OperatorError.getErrorFromStatusCode(response, 'delete')
      throw new CowError(errorMessage)
    }

    log.debug(logPrefix, `[api:${this.API_NAME}] Cancelled order`, cancellation.orderUid, chainId)
  }

  async sendOrder(
    params: { order: Omit<OrderCreation, 'appData'>; owner: string },
    options: Options = {}
  ): Promise<OrderID> {
    const fullOrder: OrderCreation = { ...params.order, appData: this.context.appDataHash }
    const { chainId: networkId, env } = options
    const chainId = networkId || (await this.context.chainId)
    const { owner } = params
    log.debug(logPrefix, `[api:${this.API_NAME}] Post signed order for network`, chainId, fullOrder)

    // Call API
    const response = await this.post(
      `/orders`,
      {
        ...fullOrder,
        signingScheme: getSigningSchemeApiValue(fullOrder.signingScheme),
        from: owner,
      },
      { chainId, env }
    )

    // Handle response
    if (!response.ok) {
      // Raise an exception
      const errorMessage = await OperatorError.getErrorFromStatusCode(response, 'create')
      throw new CowError(errorMessage)
    }

    const uid = (await response.json()) as string
    log.debug(logPrefix, `[api:${this.API_NAME}] Success posting the signed order`, uid)
    return uid
  }

  async getOrderLink(orderId: OrderID): Promise<string> {
    const baseUrl = await this.getApiBaseUrl()

    return baseUrl + `/orders/${orderId}`
  }

  private getProfile(url: string, options: Options = {}): Promise<Response> {
    return this.handleMethod(url, 'GET', this.fetchProfile.bind(this), getProfileUrl, options)
  }

  private mapNewToLegacyParams(params: FeeQuoteParams, chainId: ChainId): QuoteQuery {
    const { amount, kind, userAddress, receiver, validTo, sellToken, buyToken } = params
    const fallbackAddress = userAddress || ZERO_ADDRESS

    const baseParams = {
      sellToken: toErc20Address(sellToken, chainId),
      buyToken: toErc20Address(buyToken, chainId),
      from: fallbackAddress,
      receiver: receiver || fallbackAddress,
      appData: this.context.appDataHash,
      validTo,
      partiallyFillable: false,
    }

    const finalParams: QuoteQuery =
      kind === OrderKind.SELL
        ? {
            kind: OrderKind.SELL,
            sellAmountBeforeFee: amount,
            ...baseParams,
          }
        : {
            kind: OrderKind.BUY,
            buyAmountAfterFee: amount,
            ...baseParams,
          }

    return finalParams
  }

  protected getApiBaseUrl(): Promise<string> {
    return super.getApiBaseUrl(this.context.isDevEnvironment)
  }

  private async fetchProfile(
    url: string,
    method: 'GET' | 'POST' | 'DELETE',
    baseUrl: string,
    data?: unknown
  ): Promise<Response> {
    return fetch(baseUrl + url, {
      headers: this.DEFAULT_HEADERS,
      method,
      body: data !== undefined ? JSON.stringify(data) : data,
    })
  }

  private post(url: string, data: unknown, options: Options = {}): Promise<Response> {
    return this.handleMethod(url, 'POST', this.fetch.bind(this), getCowProtocolUrl, options, data)
  }

  private get(url: string, options: Options = {}): Promise<Response> {
    return this.handleMethod(url, 'GET', this.fetch.bind(this), getCowProtocolUrl, options)
  }

  private getProfile(url: string, options: Options = {}): Promise<Response> {
    return this.handleMethod(url, 'GET', this.fetchProfile.bind(this), getProfileUrl, options)
  }

  private delete(url: string, data: unknown, options: Options = {}): Promise<Response> {
    return this.handleMethod(url, 'DELETE', this.fetch.bind(this), getCowProtocolUrl, options, data)
  }

  private async handleMethod(
    url: string,
    method: 'GET' | 'POST' | 'DELETE',
    fetchFn: typeof this.fetch | typeof this.fetchProfile,
    getUrl: typeof getCowProtocolUrl | typeof getProfileUrl,
    options: Options = {},
    data?: unknown
  ): Promise<Response> {
    const { chainId: networkId, isDevEnvironment, requestOptions } = options
    const prodUri = getUrl('prod')
    const barnUri = getUrl('staging')

    const chainId = networkId || (await this.context.chainId)

    let response
    if (env === undefined) {
      try {
        response = await fetchFn(url, method, `${prodUri[chainId]}/${this.API_VERSION}`, data, requestOptions)
      } catch (error) {
        response = await fetchFn(url, method, `${barnUri[chainId]}/${this.API_VERSION}`, data, requestOptions)
      }
    } else {
      const uri = getUrl(env)
      response = await fetchFn(url, method, `${uri[chainId]}/${this.API_VERSION}`, data, requestOptions)
    }
    return response
  }
}
