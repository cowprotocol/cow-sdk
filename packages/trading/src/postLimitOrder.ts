import { LimitOrderAdvancedSettings, LimitOrderParameters, OrderPostingResult } from './types'
import { OrderBookApi } from '@cowprotocol/sdk-order-book'
import { buildAppData } from './appDataUtils'
import { postCoWProtocolTrade } from './postCoWProtocolTrade'
import { log } from '@cowprotocol/sdk-common'
import { applySettingsToLimitTradeParameters } from './utils/applySettingsToLimitTradeParameters'

export async function postLimitOrder(
  _params: LimitOrderParameters,
  advancedSettings?: LimitOrderAdvancedSettings,
  _orderBookApi?: OrderBookApi,
): Promise<OrderPostingResult> {
  const params = applySettingsToLimitTradeParameters(_params, advancedSettings)

  if (!params.slippageBps) {
    params.slippageBps = 0
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

  const additionalParams = {
    ...(advancedSettings?.additionalParams ?? {}),
    applyCostsSlippageAndFees: advancedSettings?.additionalParams?.applyCostsSlippageAndFees ?? false,
  }

  return postCoWProtocolTrade(orderBookApi, appDataInfo, params, additionalParams, params.signer)
}
