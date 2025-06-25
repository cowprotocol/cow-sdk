import {
  BridgeHook,
  BridgeProvider,
  BridgeQuoteResult,
  BridgeQuoteResults,
  QuoteBridgeRequest,
  QuoteBridgeRequestWithoutAmount,
} from '../types'
import { AppDataInfo, QuoteResults, SwapAdvancedSettings, TradingSdk } from '../../trading'
import { SignerLike } from '../../common'
import { Signer } from '@ethersproject/abstract-signer'
import { latest } from '@cowprotocol/app-data'

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
  appDataInfo: AppDataInfo
}

export interface BridgeResultContext<T extends BridgeQuoteResult = BridgeQuoteResult> {
  swapAndBridgeRequest: QuoteBridgeRequest
  swapResult: QuoteResults
  intermediateTokenAmount: bigint
  bridgeRequestWithoutAmount: QuoteBridgeRequestWithoutAmount
  provider: BridgeProvider<T>
  signer: Signer
  mockedHook: latest.CoWHook
  hookGasLimit: number
  validToOverride?: number
  appDataOverride?: SwapAdvancedSettings['appData']
}
