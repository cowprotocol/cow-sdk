import { LimitOrderAdvancedSettings, LimitOrderParameters, OrderPostingResult } from './types'
import { OrderBookApi } from '../order-book'
import { buildAppData } from './appDataUtils'
import { postCoWProtocolTrade } from './postCoWProtocolTrade'
import { getSigner } from '../common/utils/wallet'
import { log } from '../common/utils/log'

export async function postLimitOrder(
  params: LimitOrderParameters,
  advancedSettings?: LimitOrderAdvancedSettings,
  _orderBookApi?: OrderBookApi
): Promise<OrderPostingResult> {
  const { appCode, chainId, sellToken, buyToken, sellAmount, buyAmount, partnerFee } = params
  const appDataSlippage = advancedSettings?.appData?.metadata?.quote?.slippageBips

  /**
   * Special case for CoW Swap where we have smart slippage
   * We update appData slippage without refetching quote
   */
  if (typeof appDataSlippage !== 'undefined') {
    params.slippageBps = appDataSlippage
  }

  if (!params.slippageBps) {
    params.slippageBps = 0
  }

  if (!params.env) {
    params.env = 'prod'
  }

  log(`Limit order ${sellAmount} ${sellToken} for ${buyAmount} ${buyToken} on chain ${chainId}`)

  const signer = getSigner(params.signer)
  const orderBookApi = _orderBookApi || new OrderBookApi({ chainId, env: params.env })

  log('Building app data...')

  const appDataInfo = await buildAppData(
    {
      slippageBps: params.slippageBps,
      orderClass: 'limit',
      appCode,
      partnerFee,
    },
    advancedSettings?.appData
  )

  return postCoWProtocolTrade(orderBookApi, signer, appDataInfo, params, advancedSettings?.additionalParams)
}
