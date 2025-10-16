import type { SupportedChainId } from '@cowprotocol/sdk-config'
import type { TradeParameters, SwapAdvancedSettings } from '@cowprotocol/sdk-trading'
import type { AccountAddress } from '@cowprotocol/sdk-common'
import type { Address } from '@cowprotocol/sdk-order-book'
import type { UnsignedOrder } from '@cowprotocol/sdk-order-signing'

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
  /** The blockchain network to execute the swap on. */
  chainId: SupportedChainId
  /** Trade parameters including tokens, amounts, and validity period. */
  tradeParameters: TradeParameters
  /** The address of the collateral token to be approved for the flash loan adapter. */
  collateralToken: Address
  /** The flash loan fee as a percentage (e.g., 0.05 for 0.05%). Defaults to 0. */
  flashLoanFeePercent?: number
  /** Optional settings for controlling approval and permit behavior. */
  settings?: {
    /** Set to true to prevent automatic token approval. Default: false. */
    preventApproval?: boolean
    /** EIP-2612 permit data for gasless approval. If provided, uses permit instead of approve. */
    collateralPermit?: CollateralPermitData
  }
}

export interface CollateralSwapTradeParams {
  chainId: SupportedChainId
  validTo: number
  owner: AccountAddress
  flashLoanFeeAmount: bigint
}

export interface CollateralSwapOrder {
  sellAmount: bigint
  buyAmount: bigint
  orderToSign: UnsignedOrder
  collateralPermit?: CollateralPermitData
}

export interface CollateralSwapQuoteParams
  extends Omit<TradeParameters, 'owner' | 'validTo'>,
    CollateralSwapTradeParams {}

export interface CollateralSwapPostParams {
  swapSettings: SwapAdvancedSettings
  instanceAddress: AccountAddress
}

export interface CollateralParameters {
  trader: AccountAddress
  collateralToken: string
  amount: bigint
  instanceAddress: AccountAddress
}

export interface CollateralPermitData {
  amount: string
  deadline: number
  v: number
  r: string
  s: string
}
