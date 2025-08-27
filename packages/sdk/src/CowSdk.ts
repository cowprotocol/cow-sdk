import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import { MetadataApi } from '@cowprotocol/sdk-app-data'
import { OrderBookApi } from '@cowprotocol/sdk-order-book'
import { ApiBaseUrls } from '@cowprotocol/sdk-config'
import { ApiContext } from '@cowprotocol/sdk-config'
import { CowSdkOptions } from './types'
import { TradingSdk } from '@cowprotocol/sdk-trading'
import { OrderSigningUtils } from '@cowprotocol/sdk-order-signing'

/**
 * CowSdk is the main entry point for interacting with the CoW Protocol.
 * Provides access to all modules in a single unified interface.
 */
export class CowSdk {
  public readonly orderBook: OrderBookApi
  public readonly metadataApi: MetadataApi
  public readonly trading: TradingSdk
  public readonly orderSigning = OrderSigningUtils

  /**
   * Creates a new instance of CowSdk
   *
   * @param options Configuration options for the SDK
   */
  constructor(options: CowSdkOptions) {
    const { adapter, chainId, env = 'prod', orderBookOptions = {}, orderBookBaseUrl, tradingOptions = {} } = options

    setGlobalAdapter(adapter)

    const orderBookContext: ApiContext = {
      chainId,
      env,
      ...orderBookOptions,
    }

    if (orderBookBaseUrl) {
      orderBookContext.baseUrls = {
        ...(orderBookContext.baseUrls || {}),
        [chainId]: orderBookBaseUrl,
      } as ApiBaseUrls
    }

    this.orderBook = new OrderBookApi(orderBookContext)

    this.metadataApi = new MetadataApi()

    this.trading = new TradingSdk(tradingOptions.traderParams, {
      enableLogging: tradingOptions.options?.enableLogging,
      orderBookApi: this.orderBook,
      ...tradingOptions.options,
    })
  }
}
