import { latest as latestAppData } from '@cowprotocol/app-data'
import { ChainInfo, SupportedChainId, TargetChainId } from '../chains'
import { TokenInfo } from '../common/types/tokens'
import { Address, Amounts, OrderKind, QuoteAmountsAndCosts } from '../order-book'
import { EvmCall } from '../common/types/ethereum'
import { QuoteAndPost, QuoteResults, QuoterParameters, TradeOptionalParameters, TraderParameters } from '../trading'
import { Signer } from '@ethersproject/abstract-signer'

export interface BridgeProviderInfo {
  name: string
  logoUrl: string
}

export interface WithSellToken {
  sellTokenChainId: SupportedChainId
  sellTokenAddress: Address
  sellTokenDecimals: number
}

export interface WithBuyToken {
  buyTokenChainId: TargetChainId
  buyTokenAddress: Address
  buyTokenDecimals: number
}

export interface GetBuyTokensParams extends Partial<WithSellToken> {
  targetChainId: TargetChainId
}

/**
 * Parameters for getting a bridge quote
 */
export interface QuoteBridgeRequest
  extends WithSellToken,
    WithBuyToken,
    TradeOptionalParameters,
    Omit<QuoterParameters, 'chainId'>,
    Pick<TraderParameters, 'signer'> {
  kind: OrderKind.SELL // We make it explicit that only SELL is supported for now
  amount: bigint
  recipient?: string
  feeBps?: number
  feeRecipient?: string
}

export type QuoteBridgeRequestWithoutAmount = Omit<QuoteBridgeRequest, 'amount'>

export interface BridgeQuoteResult {
  feeBps: number
  slippageBps: number
  buyAmount: bigint
  fillTimeInSeconds?: number
}

export interface BridgeHook {
  postHook: latestAppData.CoWHook
  recipient: string
}

export enum BridgeStatus {
  NOT_INITIATED = 'not_initiated',
  IN_PROGRESS = 'in_progress',
  EXECUTED = 'executed',
  FAILED = 'failed',
  EXPIRED = 'expired',
}

export interface BridgeStatusResult {
  status: BridgeStatus
  fillTimeInSeconds?: number
}

/**
 * A bridge deposit. It includes the provideer information, sell amount and the minimum buy amount.
 *
 * It models the minimal information for a bridging order.
 *
 */
export interface BridgeDeposit extends Omit<QuoteBridgeRequest, 'amount'> {
  readonly provider: BridgeProviderInfo

  sellTokenAmount: string
  minBuyAmount: string
}

export interface BridgeProvider<Q extends BridgeQuoteResult> {
  info: BridgeProviderInfo

  /**
   * Get basic supported chains
   */
  getNetworks(): Promise<ChainInfo[]>

  /**
   * Get supported tokens for a chain
   */
  getBuyTokens(chainId: GetBuyTokensParams): Promise<TokenInfo[]>

  /**
   * Get intermediate tokens given a quote request.
   *
   * An intermediate token, is a token in the source chain, that could be used to bridge the tokens to the destination chain.
   * This method returns a sorted list of tokens, they are sorted by priority, so first tokens are more likely to be more liquid.
   *
   * @param request - The quote request
   */
  getIntermediateTokens(request: QuoteBridgeRequest): Promise<string[]>

  /**
   * Get a quote for a bridge request.
   *
   * @param request - The quote request
   */
  getQuote(request: QuoteBridgeRequest): Promise<Q>

  /**
   * Get an unsigned bridge call for a quote.
   *
   * The transaction details should be executed in the context of cow-shed account.
   *
   * @param request - The quote request
   * @param quote - The quote
   * @returns The unsigned transaction details that cow-shed needs to sign
   */
  getUnsignedBridgeCall(request: QuoteBridgeRequest, quote: Q): Promise<EvmCall>

  /**
   * Returns the estimated gas cost for executing the bridge hook.
   *
   * This method helps calculate the final amount of tokens the user will receive more accurately.
   * The estimation is done without the amount parameter to break a circular dependency:
   * 1. Hook gas costs affect the final amount
   * 2. The final amount could affect hook gas costs
   *
   * By estimating gas costs independently, we can resolve this dependency cycle.
   */
  getGasLimitEstimationForHook(request: Omit<QuoteBridgeRequest, 'amount'>): number

  /**
   * Get a pre-authorized hook for initiating a bridge.
   *
   * The hook contains the ethereum call that the trampoline contract will need to execute during the settlement to initate the bridge.
   *
   * Typically, this hook will:
   *  - Get the balance of cow-shed account
   *  - Ensure the approval for the bridge lock contract is set
   *  - Deposit into  the bridge contract
   *
   * This hook will include the pre-authorization (signature) of the owner of the cow-shed account (the trader).
   *
   * @param unsignedCall
   * @param signer
   */
  getSignedHook(chainId: SupportedChainId, unsignedCall: EvmCall, signer: Signer): Promise<BridgeHook>

  /**
   * Decode a bridge hook into a bridge deposit information.
   *
   * This method is used to recover the information about the limit order placed into the bridge locking contract.
   * This allows to load an order from the orderbook and decode the bridging hook and understand what was the minimum buy amount the user signed to receive in the destination chain.
   *
   * @param hook - The bridge hook
   */
  decodeBridgeHook(hook: BridgeHook): Promise<BridgeDeposit>

  /**
   * Get the identifier of the bridging transaction from the settlement transaction.
   * @param orderUid - The unique identifier of the order
   * @param settlementTx - The settlement transaction in which the bridging post-hook was executed
   */
  getBridgingId(orderUid: string, settlementTx: string): Promise<string>

  /**
   * Get the explorer url for a bridging id.
   *
   * @param bridgingId - The bridging id
   */
  getExplorerUrl(bridgingId: string): string

  /**
   * Get the status of a bridging transaction.
   *
   * @param bridgingId - The bridging id
   */
  getStatus(bridgingId: string): Promise<BridgeStatusResult>

  // Get a transaction to cancel a bridging transaction.
  // TODO: Review if we support cancelling bridging
  getCancelBridgingTx(bridgingId: string): Promise<EvmCall>

  // Get a transaction to refund a bridging transaction.
  // TODO: Review if we support refunding bridging
  getRefundBridgingTx(bridgingId: string): Promise<EvmCall>
}

/**
 * A quote and post for a cross-chain swap.
 *
 * If the order happens in a single chain, it returns the quote and post details for CoW Protocol.
 * If the order happens in multiple chains, it returns the quote and post details for CoW Protocol, the bridging
 * details, and a summary of the overall multi-step order.
 */
export type CrossChainQuoteAndPost = QuoteAndPost | BridgeQuoteAndPost

export interface BridgeQuoteAndPost {
  /**
   * The summary quote results for the cross-chain swap
   */
  overallResults: OverallBridgeQuoteResults

  /**
   * The quote results for the CoW Protocol order. Includes a hook to initiate the bridging.
   */
  swapResults: QuoteResults

  /**
   * The quote results for the bridging.
   *
   * Includes the bridging details.
   */
  bridgeResults: BridgeQuoteResults

  /**
   * Callback to post the swap order.
   */
  postSwapOrderFromQuote(): Promise<string>
}

/**
 * A summary of the quote result for a cross-chain swap.
 *
 * It will include the aggregated details of the two stops (the swap and the bridge)
 */
export interface OverallBridgeQuoteResults<T = bigint> {
  /**
   * Quote request for the cross-chain swap.
   */
  params: QuoteBridgeRequest

  /**
   * Summary of all the costs aggregated (swap and bridge)
   */
  amountsAndCosts: QuoteAmountsAndCosts<T>
}

export interface BridgeQuoteAmountsAndCosts<T = bigint> {
  beforeFee: Amounts<T>
  afterFee: Amounts<T>
  afterSlippage: Amounts<T>
}

export interface BridgeQuoteResults {
  /**
   * Bridge provider information
   */
  providerInfo: BridgeProviderInfo

  /**
   * Details about costs and amounts and fees of the bridging.
   */
  amountsAndCosts: BridgeQuoteAmountsAndCosts

  /**
   * Address of the intermediate token being bridged
   */
  intermediateTokenAddress: string

  /**
   * Unsigned call to initiate the bridge. This call should be executed in the context of user's cow-shed account.
   */
  unsignedBridgeCall: EvmCall

  /**
   * Pre-authorized hook to initiate the bridge. This hook has been signed, and is ready to be executed by the
   * CoW Protocol Trampoline contract after settling the swap order that buys the intermediate token.
   */
  preAuthorizedBridgingHook: BridgeHook

  /**
   * Information about the quote response from the order book API.
   */
  quoteResponse: BridgeQuoteResult
}

export type GetErc20Decimals = (chainId: TargetChainId, tokenAddress: string) => Promise<number>
