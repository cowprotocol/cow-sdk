import type { AccountAddress } from '@cowprotocol/sdk-common'
import { LimitOrderAdvancedSettings, LimitTradeParameters } from '../types'

export function applySettingsToLimitTradeParameters<T extends LimitTradeParameters>(
  _params: T,
  advancedSettings: LimitOrderAdvancedSettings | undefined,
): T {
  const params = { ..._params }

  const appDataOverride = advancedSettings?.appData
  const appDataSlippageOverride = appDataOverride?.metadata?.quote?.slippageBips
  const partnerFeeOverride = appDataOverride?.metadata?.partnerFee

  /**
   * Special case for CoW Swap where we have smart slippage
   * We update appData slippage without refetching quote
   */
  if (typeof appDataSlippageOverride !== 'undefined') {
    params.slippageBps = appDataSlippageOverride
  }

  /**
   * Same as above, in case if partnerFee dynamically changed
   */
  if (partnerFeeOverride) {
    params.partnerFee = partnerFeeOverride
  }

  /**
   * Override order parameters with advanced settings
   */
  if (advancedSettings?.quoteRequest) {
    const { receiver, validTo, sellToken, buyToken, from } = advancedSettings.quoteRequest

    if (receiver) params.receiver = receiver
    if (validTo) params.validTo = validTo
    if (sellToken) params.sellToken = sellToken
    if (buyToken) params.buyToken = buyToken
    if (from) params.owner = from as AccountAddress
  }

  if (!params.env) {
    params.env = 'prod'
  }

  return params
}
