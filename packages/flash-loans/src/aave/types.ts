import type { SupportedChainId } from '@cowprotocol/sdk-config'
import { TradeParameters } from '@cowprotocol/sdk-trading'
import { AccountAddress } from '@cowprotocol/sdk-common'

export interface FlashLoanHookAmounts {
  flashLoanAmount: string
  flashLoanFeeAmount: string
  sellAssetAmount: string
  buyAssetAmount: string
}
export interface FlashLoanHint {
  amount: string
  receiver: string
  liquidityProvider: string
  protocolAdapter: string
  token: string
}

export interface CollateralOrderData {
  owner: string
  sellAsset: string
  buyAsset: string
  sellAmount: string
  buyAmount: string
  kind: string
  validTo: number
  flashLoanAmount: string
  flashLoanFeeAmount: string
  hookSellAssetAmount: string
  hookBuyAssetAmount: string
}

export type EncodedOrder = Record<string, string | number>

/**
 * Parameters for executing a collateral swap using Aave flash loans.
 */
export interface CollateralSwapParams {
  chainId: SupportedChainId
  /** Trade parameters including tokens, amounts, and validity period. */
  tradeParameters: TradeParameters
  /** The flash loan fee as a percentage (e.g., 0.05 for 0.05%). Defaults to 0. */
  flashLoanFeePercent?: number
}

export interface CollateralSwapQuoteParams extends Omit<TradeParameters, 'owner'> {
  chainId: SupportedChainId
  amount: string
  validTo: number
  validFor: number
  owner: AccountAddress
  flashLoanFeeAmount: bigint
}
