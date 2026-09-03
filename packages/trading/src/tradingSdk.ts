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
import { postSignedOrder, PostSignedOrderResult } from './postSignedOrder'
import { getOrderToSubmit, OrderToSubmit, QuoteResultsForOrderToSubmit } from './getOrderToSubmit'
import { getQuote, getQuoteWithSigner, QuoteResultsWithSigner } from './getQuote'
import { postSellNativeCurrencyOrder } from './postSellNativeCurrencyOrder'
import { getTradeParametersAfterQuote, swapParamsToLimitOrderParams } from './utils/misc'
import { getPreSignTransaction } from './getPreSignTransaction'
import { getPreSignCallData, PreSignCallData } from './getPreSignCallData'
import {
  AbstractProviderAdapter,
  AccountAddress,
  Address,
  enableLogging,
  ERC20_ALLOWANCE_ABI,
  ERC20_APPROVE_ABI,
  getGlobalAdapter,
  setGlobalAdapter,
} from '@cowprotocol/sdk-common'
import { EnrichedOrder, OrderBookApi, SigningScheme } from '@cowprotocol/sdk-order-book'
import { OrderSigningUtils } from '@cowprotocol/sdk-order-signing'
import { getEthFlowContract } from './getEthFlowTransaction'
import { getEthFlowCancellation, getSettlementCancellation } from './onChainCancellation'
import { resolveOrderBookApi } from './utils/resolveOrderBookApi'
import { getSettlementContract } from './getSettlementContract'
import {
  COW_PROTOCOL_VAULT_RELAYER_ADDRESS,
  SupportedChainId,
  CowEnv,
  COW_PROTOCOL_VAULT_RELAYER_ADDRESS_STAGING,
  AddressPerChain,
} from '@cowprotocol/sdk-config'
import { resolveSigner } from './utils/resolveSigner'

export type WithPartialTraderParams<T> = T & Partial<TraderParameters>

/**
 * Parameters for quoting that don't require a signer.
 * Requires `owner` (the account address) instead of a signer,
 * since quoting only needs an address to estimate costs.
 */
export type QuoteOnlyParams<T> = T & Partial<Omit<TraderParameters, 'signer'>> & { owner: AccountAddress }

export type OrderTraderParams = WithPartialTraderParams<{ orderUid: string }>

/** Parameters for building pre-sign calldata without requiring a signer. */
export interface GetPreSignCallDataParams {
  orderUid: string
  chainId?: SupportedChainId
  env?: CowEnv
  settlementContractOverride?: Partial<AddressPerChain>
}

/**
 * Parameters for submitting an externally signed order.
 * Trader params are optional overrides and exclude `signer`,
 * since the signature is produced outside the SDK and no signer is ever needed.
 */
export type PostSignedOrderParams = Partial<Omit<TraderParameters, 'signer'>> & {
  orderToSubmit: OrderToSubmit
  signature: string
}

/**
 * Parameters for building an order to be signed externally.
 * No trader params: the order body is derived entirely from the quote results.
 */
export type GetOrderToSubmitParams = {
  quoteResults: QuoteResultsForOrderToSubmit
  signingScheme?: SigningScheme
}

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
    const quoteResults = await getQuoteWithSigner(
      this.mergeParams(params),
      advancedSettings,
      this.resolveOrderBookApi(params),
    )

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
      settlementContractOverride: quoterParams.settlementContractOverride,
      ethFlowContractOverride: quoterParams.ethFlowContractOverride,
    }
    const result = await getQuote(quoterParams, trader, advancedSettings, this.resolveOrderBookApi(params))

    return result.result
  }

  async getQuoteResults(
    params: WithPartialTraderParams<TradeParameters>,
    advancedSettings?: SwapAdvancedSettings,
  ): Promise<QuoteResultsWithSigner> {
    return getQuoteWithSigner(this.mergeParams(params), advancedSettings, this.resolveOrderBookApi(params))
  }

  async postSwapOrder(
    params: WithPartialTraderParams<TradeParameters>,
    advancedSettings?: SwapAdvancedSettings,
  ): Promise<OrderPostingResult> {
    return postSwapOrder(this.mergeParams(params), advancedSettings, this.resolveOrderBookApi(params))
  }

  async postLimitOrder(
    params: WithPartialTraderParams<LimitTradeParameters>,
    advancedSettings?: LimitOrderAdvancedSettings,
  ): Promise<OrderPostingResult> {
    return postLimitOrder(this.mergeParams(params), advancedSettings, this.resolveOrderBookApi(params))
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
    const quoteResults = await getQuoteWithSigner(
      this.mergeParams(params),
      advancedSettings,
      this.resolveOrderBookApi(params),
    )

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

  /**
   * Builds the order body to be signed externally, for EIP-712 signer-less flows.
   *
   * Unlike the other methods this one is synchronous and pulls nothing from the SDK's trader
   * params — the order body comes entirely from the quote, which is what the external signature
   * covers. It is the quote-time `orderToSign` struct verbatim, so nothing is recomputed here and
   * the app-data is frozen: to trade with different app-data, request a new quote and sign again.
   *
   * @param params - The quote results from {@link getQuoteOnly} (must be bound to an owner via
   * `tradeParameters.owner`), and how the external signature will be produced. `signingScheme`
   * defaults to `EIP712` (sign `quoteResults.orderTypedData` via `eth_signTypedData_v4`); pass
   * `ETHSIGN` if you `personal_sign` the order digest instead. It cannot be derived from the
   * signature bytes, which is why it is declared here, and it must match how you actually sign.
   * @returns Order body ready for {@link postSignedOrder} once the signature is attached.
   * @throws If the quote has no owner; if it sells the native token (such orders go through the
   * EthFlow contract, see {@link postSellNativeCurrencyOrder}, and cannot be submitted to the order
   * book); or if `signingScheme` is `PRESIGN` (on-chain flow, see {@link getPreSignCallData} or
   * {@link getPreSignTransaction}) or `EIP1271` (smart-account signatures, planned for a later
   * milestone).
   *
   * @example
   * ```typescript
   * const quoteResults = await sdk.getQuoteOnly({ owner, ...tradeParameters })
   * const orderToSubmit = sdk.getOrderToSubmit({ quoteResults })
   * ```
   */
  getOrderToSubmit(params: GetOrderToSubmitParams): OrderToSubmit {
    return getOrderToSubmit(params.quoteResults, params.signingScheme)
  }

  /**
   * Submits an externally signed order to the order book (uploads app-data, then sends the order).
   *
   * Use together with {@link getQuoteOnly} and {@link getOrderToSubmit} for EIP-712 signer-less
   * flows where the signature is produced outside the SDK (cold wallets or MPC/custody services).
   *
   * Unlike the other `post*` methods this takes no `advancedSettings`: every field there
   * (`quoteRequest`, `appData`, `additionalParams`) applies at quote or signing time, and changing
   * any of them here would invalidate the signature the caller already produced.
   *
   * @param params - The order body from {@link getOrderToSubmit}, the externally produced `signature`
   * over `quoteResults.orderTypedData` (`eth_signTypedData_v4`) by the order's `from` account, and
   * an optional chainId/env override defaulting to the SDK's trader params.
   * @returns The created order's UID together with the submitted signature and signing scheme.
   *
   * @example
   * ```typescript
   * const quoteResults = await sdk.getQuoteOnly({ owner, ...tradeParameters })
   * const orderToSubmit = sdk.getOrderToSubmit({ quoteResults })
   *
   * // Sign quoteResults.orderTypedData in your own environment
   * const signature = await signInYourEnvironment(quoteResults.orderTypedData)
   *
   * const { orderId } = await sdk.postSignedOrder({ orderToSubmit, signature })
   * ```
   */
  async postSignedOrder(params: PostSignedOrderParams): Promise<PostSignedOrderResult> {
    return postSignedOrder(this.resolveOrderBookApi(params), params.orderToSubmit, params.signature)
  }

  async getPreSignTransaction(params: OrderTraderParams): ReturnType<typeof getPreSignTransaction> {
    const { chainId, env, settlementContractOverride, orderUid, signer: signerLike } = this.mergeParams(params)
    const signer = resolveSigner(signerLike)

    return getPreSignTransaction(signer, chainId, orderUid, {
      env,
      settlementContractOverride,
    })
  }

  /**
   * Builds calldata for pre-signing an order without requiring a signer or making an RPC call.
   *
   * `chainId` and `env` fall back to the SDK's trader configuration and order-book context;
   * `settlementContractOverride` falls back to the trader configuration.
   *
   * Submit the returned `{ to, data, value }` through the order owner's wallet, multisig, or custody
   * stack. The transaction must be executed by the owner encoded in `orderUid`.
   */
  getPreSignCallData(params: GetPreSignCallDataParams): PreSignCallData {
    const orderBookContext = this.options.orderBookApi?.context
    const chainId = params.chainId ?? this.traderParams.chainId ?? orderBookContext?.chainId

    if (!chainId) {
      throw new Error('Missing pre-sign parameters: chainId')
    }

    return getPreSignCallData(chainId, params.orderUid, {
      env: params.env ?? this.traderParams.env ?? orderBookContext?.env,
      settlementContractOverride: params.settlementContractOverride ?? this.traderParams.settlementContractOverride,
    })
  }

  async getOrder(params: OrderTraderParams): Promise<EnrichedOrder> {
    const orderBookApi = this.resolveOrderBookApi(params)

    return orderBookApi.getOrder(params.orderUid)
  }

  async offChainCancelOrder(params: OrderTraderParams): Promise<boolean> {
    const orderBookApi = this.resolveOrderBookApi(params)
    const { env, chainId, settlementContractOverride, signer: signerLike } = this.mergeParams(params)
    const signer = resolveSigner(signerLike)
    const { orderUid } = params

    const orderCancellationSigning = await OrderSigningUtils.signOrderCancellations([orderUid], chainId, signer, {
      env,
      settlementContractOverride,
    })

    await orderBookApi.sendSignedOrderCancellations({
      ...orderCancellationSigning,
      orderUids: [orderUid],
    })

    return true
  }

  async onChainCancelOrder(params: OrderTraderParams, _order?: EnrichedOrder): Promise<string> {
    const { env, chainId, settlementContractOverride, ethFlowContractOverride } = this.mergeParams(params)

    const order = _order ?? (await this.getOrder(params))
    const isEthFlowOrder = !!order.onchainOrderData

    const signer = params.signer ? getGlobalAdapter().createSigner(params.signer) : getGlobalAdapter().signer

    const { transaction } = await (isEthFlowOrder
      ? getEthFlowCancellation(getEthFlowContract(signer, chainId, { env, ethFlowContractOverride }), order)
      : getSettlementCancellation(getSettlementContract(chainId, signer, { env, settlementContractOverride }), order))

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
    params: WithPartialTraderParams<{ tokenAddress: string; owner: string; vaultRelayerAddress?: Address }>,
  ): Promise<bigint> {
    const { env, chainId } = this.mergeParams(params)

    const adapter = getGlobalAdapter()
    const vaultRelayerAddress =
      params.vaultRelayerAddress ??
      (env === 'staging'
        ? COW_PROTOCOL_VAULT_RELAYER_ADDRESS_STAGING[chainId]
        : COW_PROTOCOL_VAULT_RELAYER_ADDRESS[chainId])

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
  async approveCowProtocol(
    params: WithPartialTraderParams<{ tokenAddress: string; amount: bigint; vaultRelayerAddress?: Address }>,
  ): Promise<string> {
    const { env, chainId, signer: signerLike } = this.mergeParams(params)

    const adapter = getGlobalAdapter()
    const signer = resolveSigner(signerLike)

    const vaultRelayerAddress =
      params.vaultRelayerAddress ??
      (env === 'staging'
        ? COW_PROTOCOL_VAULT_RELAYER_ADDRESS_STAGING[chainId]
        : COW_PROTOCOL_VAULT_RELAYER_ADDRESS[chainId])

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
    const env = params.env ?? this.traderParams.env ?? this.options.orderBookApi?.context?.env ?? 'prod'

    if (!chainId) {
      throw new Error('Chain ID is missing in getOrder() call')
    }

    return resolveOrderBookApi(chainId, env, this.options.orderBookApi)
  }

  private mergeParams<T>(params: T & Partial<TraderParameters>): T & TraderParameters {
    const { chainId, signer, appCode, env, settlementContractOverride, ethFlowContractOverride } = params
    const orderBookContext = this.options.orderBookApi?.context

    const traderParams: Partial<TraderParameters> = {
      chainId: chainId ?? this.traderParams.chainId ?? orderBookContext?.chainId,
      signer: signer ?? this.traderParams.signer ?? getGlobalAdapter().signer,
      appCode: appCode ?? this.traderParams.appCode,
      env: env ?? this.traderParams.env ?? orderBookContext?.env,
      settlementContractOverride: settlementContractOverride ?? this.traderParams.settlementContractOverride,
      ethFlowContractOverride: ethFlowContractOverride ?? this.traderParams.ethFlowContractOverride,
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
  ): T & {
    chainId: SupportedChainId
    appCode: string
    env: CowEnv
    settlementContractOverride?: Partial<AddressPerChain>
  } {
    const chainId = params.chainId ?? this.traderParams.chainId
    const appCode = params.appCode ?? this.traderParams.appCode
    const env = params.env ?? this.traderParams.env ?? this.options.orderBookApi?.context?.env ?? 'prod'
    const settlementContractOverride = params.settlementContractOverride ?? this.traderParams.settlementContractOverride
    const ethFlowContractOverride = params.ethFlowContractOverride ?? this.traderParams.ethFlowContractOverride

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
      settlementContractOverride,
      ethFlowContractOverride,
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
