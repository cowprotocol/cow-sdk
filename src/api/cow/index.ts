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
import { Context } from '../../utils/context'
import BaseApi from '../base'

const API_URL_VERSION = 'v1'

function getGnosisProtocolUrl(isDev: boolean, version = API_URL_VERSION): Partial<Record<ChainId, string>> {
  if (isDev) {
    return {
      [ChainId.MAINNET]: 'https://barn.api.cow.fi/mainnet/api/' + version,
      [ChainId.RINKEBY]: 'https://barn.api.cow.fi/rinkeby/api/' + version,
      [ChainId.GNOSIS_CHAIN]: 'https://barn.api.cow.fi/xdai/api/' + version,
    }
  }

  return {
    [ChainId.MAINNET]: 'https://api.cow.fi/mainnet/api/' + version,
    [ChainId.RINKEBY]: 'https://api.cow.fi/rinkeby/api/' + version,
    [ChainId.GNOSIS_CHAIN]: 'https://api.cow.fi/xdai/api/' + version,
  }
}

function getProfileUrl(isDev: boolean): Partial<Record<ChainId, string>> {
  if (isDev) {
    return {
      [ChainId.MAINNET]: 'https://barn.api.cow.fi/affiliate/api',
    }
  }

  return {
    [ChainId.MAINNET]: 'https://api.cow.fi/affiliate/api',
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
    super({ context, name: 'CoW Protocol', getUrl: getGnosisProtocolUrl })
  }

  async getProfileData(address: string, options: Options = {}): Promise<ProfileData | null> {
    const { chainId: networkId, isDevEnvironment } = options
    const chainId = networkId || (await this.context.chainId)
    log.debug(logPrefix, `[api:${this.API_NAME}] Get profile data for`, chainId, address)
    if (chainId !== ChainId.MAINNET) {
      log.info(logPrefix, 'Profile data is only available for mainnet')
      return null
    }

    const response = await this.getProfile(`/profile/${address}`, { chainId, isDevEnvironment })

    if (!response.ok) {
      const errorResponse = await response.json()
      log.error(logPrefix, errorResponse)
      throw new CowError(errorResponse?.description)
    } else {
      return response.json()
    }
  }

  async getTrades(params: GetTradesParams, options: Options = {}): Promise<TradeMetaData[]> {
    const { chainId: networkId, isDevEnvironment = this.context.isDevEnvironment } = options
    const { owner, orderId, limit, offset } = params
    if (owner && orderId) {
      throw new CowError('Cannot specify both owner and orderId')
    }
    const qsParams = objectToQueryString({ owner, orderUid: orderId, limit, offset })
    const chainId = networkId || (await this.context.chainId)
    log.debug(logPrefix, '[util:operator] Get trades for', chainId, { owner, orderId, limit, offset })
    try {
      const response = await this.get(`/trades${qsParams}`, { chainId, isDevEnvironment })

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
    const { chainId: networkId, isDevEnvironment = this.context.isDevEnvironment } = options
    const { owner, limit = 1000, offset = 0 } = params
    const queryString = objectToQueryString({ limit, offset })
    const chainId = networkId || (await this.context.chainId)
    log.debug(logPrefix, `[api:${this.API_NAME}] Get orders for `, chainId, owner, limit, offset)

    try {
      const response = await this.get(`/account/${owner}/orders/${queryString}`, { chainId, isDevEnvironment })

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
    const { chainId: networkId, isDevEnvironment } = options
    const chainId = networkId || (await this.context.chainId)
    log.debug(`[api:${this.API_NAME}] Get tx orders for `, chainId, txHash)

    try {
      const response = await this.get(`/transactions/${txHash}/orders`, { chainId, isDevEnvironment })

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
    const { chainId: networkId, isDevEnvironment } = options
    const chainId = networkId || (await this.context.chainId)
    log.debug(logPrefix, `[api:${this.API_NAME}] Get order for `, chainId, orderId)
    try {
      const response = await this.get(`/orders/${orderId}`, { chainId, isDevEnvironment })

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
    const { chainId: networkId, isDevEnvironment } = options
    const { baseToken, quoteToken, amount, kind } = params
    const chainId = networkId || (await this.context.chainId)
    log.debug(logPrefix, `[api:${this.API_NAME}] Get price from API`, params, 'for', chainId)

    const response = await this.get(
      `/markets/${toErc20Address(baseToken, chainId)}-${toErc20Address(quoteToken, chainId)}/${kind}/${amount}`,
      { chainId, isDevEnvironment }
    ).catch((error) => {
      log.error(logPrefix, 'Error getting price quote:', error)
      throw new QuoteError(UNHANDLED_QUOTE_ERROR)
    })

    return _handleQuoteResponse<PriceInformation | null>(response)
  }

  async getQuote(params: FeeQuoteParams, options: Options = {}): Promise<SimpleGetQuoteResponse> {
    const { chainId: networkId, isDevEnvironment } = options
    const chainId = networkId || (await this.context.chainId)
    const quoteParams = this.mapNewToLegacyParams(params, chainId)
    const response = await this.post('/quote', quoteParams, { chainId, isDevEnvironment })

    return _handleQuoteResponse<SimpleGetQuoteResponse>(response)
  }

  async sendSignedOrderCancellation(params: OrderCancellationParams, options: Options = {}): Promise<void> {
    const { chainId: networkId, isDevEnvironment } = options
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
      { chainId, isDevEnvironment }
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
    const { chainId: networkId, isDevEnvironment } = options
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
      { chainId, isDevEnvironment }
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
}
