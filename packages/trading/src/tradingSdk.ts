import {
  LimitOrderAdvancedSettings,
  LimitTradeParameters,
  OrderPostingResult,
  QuoteAndPost,
  QuoterParameters,
  QuoteResults,
  SigningStepManager,
  SwapAdvancedSettings,
  TradeParameters,
  TraderParameters,
} from './types'
import { postSwapOrder, postSwapOrderFromQuote } from './postSwapOrder'
import { postLimitOrder } from './postLimitOrder'
import { getQuote, getQuoteWithSigner, QuoteResultsWithSigner } from './getQuote'
import { postSellNativeCurrencyOrder } from './postSellNativeCurrencyOrder'
import { getTradeParametersAfterQuote, swapParamsToLimitOrderParams } from './utils/misc'
import { getPreSignTransaction } from './getPreSignTransaction'
import {
  AbstractProviderAdapter,
  AccountAddress,
  enableLogging,
  ERC20_ALLOWANCE_ABI,
  ERC20_APPROVE_ABI,
  getGlobalAdapter,
  setGlobalAdapter,
} from '@cowprotocol/sdk-common'
import { EnrichedOrder, OrderBookApi } from '@cowprotocol/sdk-order-book'
import { OrderSigningUtils } from '@cowprotocol/sdk-order-signing'
import { getEthFlowContract } from './getEthFlowTransaction'
import { getEthFlowCancellation, getSettlementCancellation } from './onChainCancellation'
import { resolveOrderBookApi } from './utils/resolveOrderBookApi'
import { getSettlementContract } from './getSettlementContract'
import { COW_PROTOCOL_VAULT_RELAYER_ADDRESS, SupportedChainId, CowEnv } from '@cowprotocol/sdk-config'
import { resolveSigner } from './utils/resolveSigner'

export type WithPartialTraderParams<T> = T & Partial<TraderParameters>

/**
 * Parameters for quoting that don't require a signer.
 * Requires `owner` (the account address) instead of a signer,
 * since quoting only needs an address to estimate costs.
 */
export type QuoteOnlyParams<T> = T &
  Partial<Omit<TraderParameters, 'signer'>> & { owner: AccountAddress }

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

  /**
   * Gets a quote without requiring a signer or wallet connection.
   * Useful for building UIs that preview swap quotes before the user connects a wallet.
   *
   * Unlike {@link getQuote}, this method only requires an `owner` address (the account
   * to quote for) instead of a signer. The returned result contains quote information
   * but no `postSwapOrderFromQuote` helper, since posting requires signing.
   *
   * @param params - Trade parameters with `owner` address. Signer is not needed.
   * @param advancedSettings - Optional advanced settings for the swap quote.
   * @returns Quote results including amounts, costs, slippage, and order data.
   *
   * @example
   * ```typescript
   * // Get a quote without a connected wallet
   * const sdk = new TradingSdk(
   *   { chainId: 1, appCode: 'My App' },
   *   { orderBookApi },
   * )
   *
   * const quoteResults = await sdk.getQuoteOnly({
   *   owner: '0x1234...', // any valid address
   *   kind: OrderKind.SELL,
   *   sellToken: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
   *   sellTokenDecimals: 6,
   *   buyToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
   *   buyTokenDecimals: 18,
   *   amount: '1000000000', // 1000 USDC
   * })
   *
   * console.log(quoteResults.amountsAndCosts)
   * ```
   */
  async getQuoteOnly(
    params: QuoteOnlyParams<TradeParameters>,
    advancedSettings?: SwapAdvancedSettings,
  ): Promise<QuoteResults> {
    const quoterParams = this.mergeQuoterParams(params)
    const trader: QuoterParameters = {
      chainId: quoterParams.chainId,
      appCode: quoterParams.appCode,
      env: quoterParams.env,
      account: quoterParams.owner,
    }
    const result = await getQuote(quoterParams, trader, advancedSettings, this.options.orderBookApi)

    return result.result
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

  async getPreSignTransaction(params: OrderTraderParams): ReturnType<typeof getPreSignTransaction> {
    const traderParams = this.mergeParams(params)
    const signer = resolveSigner(traderParams.signer)

    return getPreSignTransaction(signer, traderParams.chainId, params.orderUid)
  }

  async getOrder(params: OrderTraderParams): Promise<EnrichedOrder> {
    const orderBookApi = this.resolveOrderBookApi(params)

    return orderBookApi.getOrder(params.orderUid)
  }

  async offChainCancelOrder(params: OrderTraderParams): Promise<boolean> {
    const orderBookApi = this.resolveOrderBookApi(params)
    const signer = resolveSigner(params.signer)
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

    const { transaction } = await (isEthFlowOrder
      ? getEthFlowCancellation(getEthFlowContract(signer, chainId, params.env ?? this.traderParams.env), order)
      : getSettlementCancellation(getSettlementContract(chainId, signer), order))

    const txReceipt = await signer.sendTransaction(transaction)

    return txReceipt.hash
  }

  /**
   * Checks the current allowance for the CoW Protocol Vault Relayer to spend an ERC-20 token.
   *
   * @param params - Parameters including token address and owner address
   * @returns Promise resolving to the current allowance amount as a bigint
   *
   * @example
   * ```typescript
   * const params = {
   *   tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
   *   owner: '0x123...',
   *   chainId: 1,
   * }
   *
   * const allowance = await sdk.getCowProtocolAllowance(params)
   * console.log('Current allowance:', allowance.toString())
   * ```
   */
  async getCowProtocolAllowance(
    params: WithPartialTraderParams<{ tokenAddress: string; owner: string }>,
  ): Promise<bigint> {
    const chainId = params.chainId || this.traderParams.chainId

    if (!chainId) {
      throw new Error('Chain ID is missing in getCowProtocolAllowance() call')
    }

    const adapter = getGlobalAdapter()
    const vaultRelayerAddress = COW_PROTOCOL_VAULT_RELAYER_ADDRESS[chainId]

    return (await adapter.readContract({
      address: params.tokenAddress,
      abi: ERC20_ALLOWANCE_ABI,
      functionName: 'allowance',
      args: [params.owner, vaultRelayerAddress],
    })) as bigint
  }

  /**
   * Approves the CoW Protocol Vault Relayer to spend a specified amount of an ERC-20 token.
   * This method creates an on-chain approval transaction.
   *
   * @param params - Parameters including token address and amount to approve
   * @returns Promise resolving to the transaction hash of the approval transaction
   *
   * @example
   * ```typescript
   * const params = {
   *   tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
   *   amount: '1000000000', // 1000 USDC (6 decimals)
   *   chainId: 1,
   * }
   *
   * const txHash = await sdk.approveCowProtocol(params)
   * console.log('Approval transaction:', txHash)
   * ```
   */
  async approveCowProtocol(params: WithPartialTraderParams<{ tokenAddress: string; amount: bigint }>): Promise<string> {
    const chainId = params.chainId || this.traderParams.chainId

    if (!chainId) {
      throw new Error('Chain ID is missing in approveCowProtocol() call')
    }

    const adapter = getGlobalAdapter()
    const signer = resolveSigner(params.signer)

    const vaultRelayerAddress = COW_PROTOCOL_VAULT_RELAYER_ADDRESS[chainId]

    const txParams = {
      to: params.tokenAddress,
      data: adapter.utils.encodeFunction(ERC20_APPROVE_ABI, 'approve', [
        vaultRelayerAddress,
        '0x' + params.amount.toString(16),
      ]),
    }

    const txReceipt = await signer.sendTransaction(txParams)

    return txReceipt.hash
  }

  private resolveOrderBookApi(params: Partial<TraderParameters>): OrderBookApi {
    const chainId = params.chainId ?? this.traderParams.chainId
    const env = params.env ?? this.traderParams.env ?? 'prod'

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

  /**
   * Merges quoter-specific parameters (chainId, appCode, env, owner) without requiring a signer.
   * Used by quote-only operations that don't need signing capability.
   */
  private mergeQuoterParams<T extends { owner: AccountAddress }>(
    params: T & Partial<Omit<TraderParameters, 'signer'>>,
  ): T & { chainId: SupportedChainId; appCode: string; env: CowEnv } {
    const chainId = params.chainId || this.traderParams.chainId
    const appCode = params.appCode || this.traderParams.appCode
    const env = params.env || this.traderParams.env || 'prod'

    if (!chainId) {
      throw new Error('Missing quoter parameters: chainId')
    }
    if (!appCode) {
      throw new Error('Missing quoter parameters: appCode')
    }

    return {
      ...params,
      chainId,
      appCode,
      env,
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
