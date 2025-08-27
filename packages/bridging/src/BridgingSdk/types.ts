import { QuoteResults, SwapAdvancedSettings, TradingAppDataInfo, TradingSdk } from '@cowprotocol/sdk-trading'
import {
  BridgeHook,
  BridgeProvider,
  BridgeQuoteResult,
  BridgeQuoteResults,
  QuoteBridgeRequest,
  QuoteBridgeRequestWithoutAmount,
} from '../types'
import { SignerLike } from '@cowprotocol/sdk-common'

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
