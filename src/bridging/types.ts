import { latest as latestAppData } from '@cowprotocol/app-data'
import { ethers } from 'ethers'
import { ChainInfo, ChainId } from '../common'
import { TokenInfo } from '../common/types/tokens'
import { Address, OrderKind } from '../order-book'
import { EvmCall } from '../common/types/ethereum'

export interface BridgeProviderInfo {
  name: string
  logoUrl: string
}

export interface WithSellToken {
  sellTokenChainId: ChainId
  sellTokenAddress: Address
  sellTokenDecimals: number
}

export interface WithBuyToken {
  buyTokenChainId: ChainId
  buyTokenAddress: Address
  buyTokenDecimals: number
}

export interface GetBuyTokensParams extends Partial<WithSellToken> {
  targetChainId: ChainId
}

/**
 * Parameters for getting a bridge quote
 */
export interface QuoteBridgeRequest extends WithSellToken, WithBuyToken {
  type: OrderKind.SELL // We make it explicit that only SELL is supported for now
  amount: string
  recipient: string
}

export interface QuoteFee {
  type: 'fixed' | 'percent'
  value: number
}

export interface BridgeQuoteResult {
  fee: QuoteFee
  slippageBps: number
  buyAmount: string
  fillTimeInSeconds?: number
}

export interface BridgeHook {
  postHook: latestAppData.CoWHook
  recipient: string
}

export enum BridgeStatus {
  NOT_INITIATED = 'not_initiated',
  INITIATED = 'initiated',
  EXECUTED = 'executed',
  FAILED = 'failed',
  EXPIRED = 'expired',
}

export interface BridgeStatusResult {
  status: BridgeStatus
  fillTimeInSeconds?: number
}

/**
 * A bridge deposit. It includes the sell amount and the minimum buy amount.
 *
 * It models the minimum information needed to initiate a bridge and that it can also be extracted from the cow hook.
 *
 */
export interface BridgeDeposit extends Omit<QuoteBridgeRequest, 'amount'> {
  provider: BridgeProviderInfo

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
   * Get an unsigned bridge transaction for a quote.
   *
   * The transaction details should be executed in the context of cow-shed account.
   *
   * @param request - The quote request
   * @param quote - The quote
   * @returns The unsigned transaction details that cow-shed needs to sign
   */
  getUnsignedBridgeTx(request: QuoteBridgeRequest, quote: Q): Promise<EvmCall>

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
   * @param unsignedTx
   * @param signer
   */
  getSignedHook(unsignedTx: EvmCall, signer: ethers.Signer): Promise<BridgeHook>

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
