import type { QuoteResults, SwapAdvancedSettings, TradingAppDataInfo, TradingSdk } from '@cowprotocol/sdk-trading'
import type {
  BridgeHook,
  BridgeProvider,
  BridgeQuoteResult,
  BridgeQuoteResults,
  QuoteBridgeRequest,
  QuoteBridgeRequestWithoutAmount,
} from '../types'
import type { SignerLike } from '@cowprotocol/sdk-common'
import type { CowEnv, SupportedChainId } from '@cowprotocol/sdk-config'

export type GetQuoteWithBridgeParams<T extends BridgeQuoteResult> = {
  /**
   * Overall request for the swap and the bridge.
   */
  swapAndBridgeRequest: QuoteBridgeRequest

  /**
   * Advanced settings for the swap.
   */
  advancedSettings?: SwapAdvancedSettings

  /**
   * Provider for the bridge.
   */
  provider: BridgeProvider<T>

  /**
   * Trading SDK.
   */
  tradingSdk: TradingSdk

  /**
   * For quote fetching we have to sign bridging hooks.
   * But we won't do that using users wallet and will use some static PK.
   */
  bridgeHookSigner?: SignerLike
}

export interface GetBridgeResultResult {
  bridgeResult: BridgeQuoteResults
  bridgeHook: BridgeHook
  appDataInfo: TradingAppDataInfo
}

export interface BridgeResultContext<T extends BridgeQuoteResult = BridgeQuoteResult> {
  swapAndBridgeRequest: QuoteBridgeRequest
  swapResult: QuoteResults
  intermediateTokenAmount: bigint
  bridgeRequestWithoutAmount: QuoteBridgeRequestWithoutAmount
  provider: BridgeProvider<T>
  signer?: SignerLike
  hookGasLimit: number
  validToOverride?: number
  appDataOverride?: SwapAdvancedSettings['appData']
}

/**
 * Parameters for the `getOrder` method.
 */
export interface GetOrderParams {
  /**
   * Id of a network where order was settled
   */
  chainId: SupportedChainId
  /**
   * The unique identifier of the order.
   */
  orderId: string

  /**
   * The environment of the order
   */
  env?: CowEnv
}
