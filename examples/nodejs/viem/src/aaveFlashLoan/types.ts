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

export type EncodedOrder = Record<string, string | number>
