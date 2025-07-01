import { setGlobalAdapter } from '@cowprotocol/sdk-common'
import { MetadataApi } from '@cowprotocol/sdk-app-data'
import { OrderBookApi } from '@cowprotocol/sdk-order-book'
import { ApiBaseUrls, SupportedChainId } from '@cowprotocol/sdk-config'
import { ApiContext } from '@cowprotocol/sdk-config'
import { CowSdkOptions } from './types'
import { SubgraphApi } from '@cowprotocol/sdk-subgraph'
import { ContractsTs } from '@cowprotocol/sdk-contracts-ts'
import { CowShedSdk } from '@cowprotocol/sdk-cow-shed'
import { TradingSdk } from '@cowprotocol/sdk-trading'
import { ConditionalOrderFactory, Multiplexer, ProofLocation } from '@cowprotocol/sdk-composable'
import { OrderSigningUtils } from '@cowprotocol/sdk-order-signing'

// Re-export all components for easier access
export * from '@cowprotocol/sdk-app-data'
export * from '@cowprotocol/sdk-order-book'
export * from '@cowprotocol/sdk-subgraph'
export * from '@cowprotocol/sdk-contracts-ts'
export * from '@cowprotocol/sdk-cow-shed'
export * from '@cowprotocol/sdk-trading'
export * from '@cowprotocol/sdk-composable'
export * from '@cowprotocol/sdk-order-signing'

/**
 * CowSdk is the main entry point for interacting with the CoW Protocol.
 * Provides access to all modules in a single unified interface.
 */
export class CowSdk {
  public readonly orderBook: OrderBookApi
  public readonly appData: MetadataApi
  public readonly subgraph: SubgraphApi
  public readonly contracts: ContractsTs
  public readonly cowShed?: CowShedSdk
  public readonly trading?: TradingSdk
  public readonly composable?: {
    factory: ConditionalOrderFactory
    multiplexer?: Multiplexer
  }
  public readonly orderSigning: OrderSigningUtils

  private readonly chainId: SupportedChainId

  /**
   * Creates a new instance of CowSdk
   *
   * @param options Configuration options for the SDK
   */
  constructor(options: CowSdkOptions) {
    const {
      adapter,
      chainId,
      env = 'prod',
      orderBookOptions = {},
      orderBookBaseUrl,
      subgraphOptions = {},
      subgraphBaseUrl,
      tradingOptions = {},
      composableOptions = {},
      cowShedOptions = {},
    } = options

    this.chainId = chainId

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

    this.appData = new MetadataApi(adapter)

    const subgraphContext = {
      chainId,
      env,
      ...(subgraphOptions.context || {}),
      ...(subgraphBaseUrl && {
        baseUrls: Object.values(SupportedChainId).reduce(
          (acc, chainId) => ({
            ...acc,
            [chainId]: chainId === this.chainId ? subgraphBaseUrl : null,
          }),
          {},
        ) as Record<SupportedChainId, string | null>,
      }),
    }

    this.subgraph = new SubgraphApi(subgraphContext, subgraphOptions.apiKey)

    this.contracts = new ContractsTs(adapter)

    this.cowShed = new CowShedSdk(adapter, cowShedOptions.factoryOptions)

    this.trading = new TradingSdk(
      tradingOptions.traderParams,
      {
        enableLogging: tradingOptions.options?.enableLogging,
        orderBookApi: this.orderBook,
        ...tradingOptions.options,
      },
      adapter,
    )

    this.composable = {
      factory: new ConditionalOrderFactory(composableOptions.registry || {}, adapter),
      multiplexer: new Multiplexer(
        chainId,
        composableOptions.orders,
        composableOptions.root,
        composableOptions.location || ProofLocation.PRIVATE,
      ),
    }

    this.orderSigning = new OrderSigningUtils(adapter)
  }
}
