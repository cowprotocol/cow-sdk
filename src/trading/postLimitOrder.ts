import { LimitOrderAdvancedSettings, LimitOrderParameters } from './types'
import { OrderBookApi } from '../order-book'
import { buildAppData } from './appDataUtils'
import { postCoWProtocolTrade } from './postCoWProtocolTrade'
import { getSigner } from '../common/utils/wallet'
import { log } from '../common/utils/log'

export async function postLimitOrder(
  params: LimitOrderParameters,
  advancedSettings?: LimitOrderAdvancedSettings,
  _orderBookApi?: OrderBookApi
): Promise<string> {
  const {
    appCode,
    chainId,
    sellToken,
    buyToken,
    sellAmount,
    buyAmount,
    partnerFee,
    slippageBps = 0,
    env = 'prod',
  } = params

  log(`Limit order ${sellAmount} ${sellToken} for ${buyAmount} ${buyToken} on chain ${chainId}`)

  const signer = getSigner(params.signer)
  const orderBookApi = _orderBookApi || new OrderBookApi({ chainId, env })

  log('Building app data...')

  const appDataInfo = await buildAppData(
    {
      slippageBps,
      orderClass: 'limit',
      appCode,
      partnerFee,
    },
    advancedSettings?.appData
  )

  return postCoWProtocolTrade(orderBookApi, signer, appDataInfo, params, advancedSettings?.additionalParams)
}
