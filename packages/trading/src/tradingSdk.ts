import {
  LimitOrderAdvancedSettings,
  LimitTradeParameters,
  OrderPostingResult,
  QuoteAndPost,
  SigningStepManager,
  SwapAdvancedSettings,
  TradeParameters,
  TraderParameters,
} from './types'
import { postSwapOrder, postSwapOrderFromQuote } from './postSwapOrder'
import { postLimitOrder } from './postLimitOrder'
import { getQuoteWithSigner, QuoteResultsWithSigner } from './getQuote'
import { postSellNativeCurrencyOrder } from './postSellNativeCurrencyOrder'
import { getTradeParametersAfterQuote, swapParamsToLimitOrderParams } from './utils/misc'
import { getPreSignTransaction } from './getPreSignTransaction'
import { ContractFactory, enableLogging, getGlobalAdapter } from '@cowprotocol/sdk-common'
import { EnrichedOrder, OrderBookApi } from '@cowprotocol/sdk-order-book'
import { AbstractProviderAdapter, setGlobalAdapter } from '@cowprotocol/sdk-common'
import { OrderSigningUtils } from '@cowprotocol/sdk-order-signing'
import { getEthFlowContract } from './getEthFlowTransaction'
import { getEthFlowCancellation, getSettlementCancellation } from './onChainCancellation'
import { resolveOrderBookApi } from './utils/resolveOrderBookApi'

export type WithPartialTraderParams<T> = T & Partial<TraderParameters>

export type OrderTraderParams = WithPartialTraderParams<{ orderUid: string }>

export interface TradingSdkOptions {
  enableLogging: boolean
  orderBookApi: OrderBookApi
}

export class TradingSdk {
  constructor(
    public traderParams: Partial<TraderParameters> = {},
    public readonly options: Partial<TradingSdkOptions> = {},
    adapter?: AbstractProviderAdapter,
  ) {
    if (options.enableLogging !== undefined) {
      enableLogging(options.enableLogging)
    }
    if (adapter) {
      setGlobalAdapter(adapter)
    }
  }

  setTraderParams(params: Partial<TraderParameters>) {
    this.traderParams = { ...this.traderParams, ...params }

    if (this.options.orderBookApi) {
      if (params.chainId) {
        this.options.orderBookApi.context.chainId = params.chainId
      }

      if (params.env) {
        this.options.orderBookApi.context.env = params.env
      }
    }

    return this
  }

  async getQuote(
    params: WithPartialTraderParams<TradeParameters>,
    advancedSettings?: SwapAdvancedSettings,
  ): Promise<QuoteAndPost> {
    const quoteResults = await getQuoteWithSigner(this.mergeParams(params), advancedSettings, this.options.orderBookApi)

    return {
      quoteResults: quoteResults.result,
      postSwapOrderFromQuote: async (
        advancedSettings?: SwapAdvancedSettings,
        signingStepManager?: SigningStepManager,
      ) => {
        await signingStepManager?.beforeOrderSign?.()

        return postSwapOrderFromQuote(
          {
            ...quoteResults,
            result: {
              ...quoteResults.result,
              tradeParameters: getTradeParametersAfterQuote({
                quoteParameters: quoteResults.result.tradeParameters,
                sellToken: params.sellToken,
              }),
              // It's important to get a fresh instance of the signer
              // Because quote might be called with another signer
              signer: getGlobalAdapter().signer,
            },
          },
          advancedSettings,
        )
          .catch((error) => {
            signingStepManager?.onOrderSignError?.()
            throw error
          })
          .then((result) => {
            signingStepManager?.afterOrderSign?.()

            return result
          })
      },
    }
  }

  async getQuoteResults(
    params: WithPartialTraderParams<TradeParameters>,
    advancedSettings?: SwapAdvancedSettings,
  ): Promise<QuoteResultsWithSigner> {
    return getQuoteWithSigner(this.mergeParams(params), advancedSettings, this.options.orderBookApi)
  }

  async postSwapOrder(
    params: WithPartialTraderParams<TradeParameters>,
    advancedSettings?: SwapAdvancedSettings,
  ): Promise<OrderPostingResult> {
    return postSwapOrder(this.mergeParams(params), advancedSettings, this.options.orderBookApi)
  }

  async postLimitOrder(
    params: WithPartialTraderParams<LimitTradeParameters>,
    advancedSettings?: LimitOrderAdvancedSettings,
  ): Promise<OrderPostingResult> {
    return postLimitOrder(this.mergeParams(params), advancedSettings, this.options.orderBookApi)
  }

  /**
   * Posts a sell order for native currency (e.g., ETH) using the EthFlow contract.
   * This method creates an on-chain transaction for selling native tokens.
   *
   * @param params - The trade parameters including token addresses and amounts
   * @param advancedSettings - Optional advanced settings for the swap
   * @returns Promise resolving to the order posting result with transaction hash and order ID
   *
   * @example
   * ```typescript
   * const parameters: TradeParameters = {
   *   kind: OrderKind.SELL,
   *   sellToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // Native ETH
   *   sellTokenDecimals: 18,
   *   buyToken: '0x0625afb445c3b6b7b929342a04a22599fd5dbb59',
   *   buyTokenDecimals: 18,
   *   amount: '100000000000000000', // 0.1 ETH
   * }
   *
   * const { orderId, txHash } = await sdk.postSellNativeCurrencyOrder(parameters)
   * ```
   */
  async postSellNativeCurrencyOrder(
    params: WithPartialTraderParams<TradeParameters>,
    advancedSettings?: SwapAdvancedSettings,
  ): Promise<ReturnType<typeof postSellNativeCurrencyOrder>> {
    const quoteResults = await getQuoteWithSigner(this.mergeParams(params), advancedSettings, this.options.orderBookApi)

    const { tradeParameters, quoteResponse } = quoteResults.result
    return postSellNativeCurrencyOrder(
      quoteResults.orderBookApi,
      quoteResults.result.appDataInfo,
      // Quote response always has an id
      swapParamsToLimitOrderParams(
        getTradeParametersAfterQuote({ quoteParameters: tradeParameters, sellToken: params.sellToken }),
        quoteResponse,
      ),
      advancedSettings?.additionalParams,
      quoteResults.result.signer,
    )
  }

  async getPreSignTransaction(
    params: WithPartialTraderParams<{ orderId: string; account: string }>,
  ): ReturnType<typeof getPreSignTransaction> {
    const adapter = getGlobalAdapter()

    const traderParams = this.mergeParams(params)
    const signer = traderParams.signer ? adapter.createSigner(traderParams.signer) : adapter.signer

    return getPreSignTransaction(signer, traderParams.chainId, params.account, params.orderId)
  }

  async getOrder(params: OrderTraderParams): Promise<EnrichedOrder> {
    const orderBookApi = this.resolveOrderBookApi(params)

    return orderBookApi.getOrder(params.orderUid)
  }

  async offChainCancelOrder(params: OrderTraderParams): Promise<boolean> {
    const orderBookApi = this.resolveOrderBookApi(params)
    const adapter = getGlobalAdapter()

    const signer = params.signer ? adapter.createSigner(params.signer) : adapter.signer

    const { orderUid } = params
    const chainId = params.chainId || this.traderParams.chainId

    if (!chainId) {
      throw new Error('Chain ID is missing in offChainCancelOrder() call')
    }

    const orderCancellationSigning = await OrderSigningUtils.signOrderCancellations([orderUid], chainId, signer)

    await orderBookApi.sendSignedOrderCancellations({
      ...orderCancellationSigning,
      orderUids: [orderUid],
    })

    return true
  }

  async onChainCancelOrder(params: OrderTraderParams, _order?: EnrichedOrder): Promise<string> {
    const chainId = params.chainId || this.traderParams.chainId

    if (!chainId) {
      throw new Error('Chain ID is missing in offChainCancelOrder() call')
    }

    const order = _order ?? (await this.getOrder(params))
    const isEthFlowOrder = !!order.onchainOrderData

    const signer = params.signer ? getGlobalAdapter().createSigner(params.signer) : getGlobalAdapter().signer
    const account = await signer.getAddress()

    const { transaction } = await (isEthFlowOrder
      ? getEthFlowCancellation(getEthFlowContract(signer, chainId, params.env), order)
      : getSettlementCancellation(ContractFactory.createSettlementContract(account, signer), order))

    const txReceipt = await signer.sendTransaction(transaction)

    return txReceipt.hash
  }

  private resolveOrderBookApi(params: Partial<TraderParameters>): OrderBookApi {
    const chainId = params.chainId || this.traderParams.chainId
    const env = params.env || 'prod'

    if (!chainId) {
      throw new Error('Chain ID is missing in getOrder() call')
    }

    return resolveOrderBookApi(chainId, env)
  }

  private mergeParams<T>(params: T & Partial<TraderParameters>): T & TraderParameters {
    const { chainId, signer, appCode, env } = params
    const traderParams: Partial<TraderParameters> = {
      chainId: chainId || this.traderParams.chainId,
      signer: signer || this.traderParams.signer || getGlobalAdapter().signer,
      appCode: appCode || this.traderParams.appCode,
      env: env || this.traderParams.env,
    }
    assertTraderParams(traderParams)

    return {
      ...params,
      ...traderParams,
    }
  }
}

function assertTraderParams(params: Partial<TraderParameters>): asserts params is TraderParameters {
  if (!isTraderParameters(params)) {
    throw new Error('Missing trader parameters: ' + getMissingTraderParams(params).join(', '))
  }
}

function getMissingTraderParams(params: Partial<TraderParameters>): string[] {
  const missingParams = []
  if (!params.chainId) missingParams.push('chainId')
  if (!params.signer) missingParams.push('signer')
  if (!params.appCode) missingParams.push('appCode')
  return missingParams
}

function isTraderParameters(params: Partial<TraderParameters>): params is TraderParameters {
  return getMissingTraderParams(params).length === 0
}
