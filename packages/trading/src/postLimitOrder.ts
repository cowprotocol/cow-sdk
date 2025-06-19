import { LimitOrderAdvancedSettings, LimitOrderParameters, OrderPostingResult } from './types'
import { OrderBookApi } from '@cowprotocol/sdk-order-book'
import { buildAppData } from './appDataUtils'
import { postCoWProtocolTrade } from './postCoWProtocolTrade'
import { log } from '@cowprotocol/sdk-common'

export async function postLimitOrder(
  params: LimitOrderParameters,
  advancedSettings?: LimitOrderAdvancedSettings,
  _orderBookApi?: OrderBookApi,
): Promise<OrderPostingResult> {
  const appDataSlippage = advancedSettings?.appData?.metadata?.quote?.slippageBips
  const partnerFeeOverride = advancedSettings?.appData?.metadata?.partnerFee

  /**
   * Special case for CoW Swap where we have suggested slippage
   * We update appData slippage without refetching quote
   */
  if (typeof appDataSlippage !== 'undefined') {
    params.slippageBps = appDataSlippage
  }

  /**
   * Same as above, in case if partnerFee dynamically changed
   */
  if (partnerFeeOverride) {
    params.partnerFee = partnerFeeOverride
  }

  if (!params.slippageBps) {
    params.slippageBps = 0
  }

  if (!params.env) {
    params.env = 'prod'
  }

  const { appCode, chainId, sellToken, buyToken, sellAmount, buyAmount, partnerFee } = params

  log(`Limit order ${sellAmount} ${sellToken} for ${buyAmount} ${buyToken} on chain ${chainId}`)

  const orderBookApi = _orderBookApi || new OrderBookApi({ chainId, env: params.env })

  log('Building app data...')

  const appDataInfo = await buildAppData(
    {
      slippageBps: params.slippageBps,
      orderClass: 'limit',
      appCode,
      partnerFee,
    },
    advancedSettings?.appData,
  )

  return postCoWProtocolTrade(orderBookApi, params.signer, appDataInfo, params, advancedSettings?.additionalParams)
}
