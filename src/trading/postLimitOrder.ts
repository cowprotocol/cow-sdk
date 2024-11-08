import { LimitOrderAdvancedSettings, LimitOrderParameters } from './types'
import { log } from './consts'
import { OrderBookApi } from '../order-book'
import { buildAppData } from './appDataUtils'
import { postCoWProtocolTrade } from './postCoWProtocolTrade'
import { getSigner } from './utils'

export async function postLimitOrder(params: LimitOrderParameters, advancedSettings?: LimitOrderAdvancedSettings) {
  const {
    appCode,
    chainId,
    sellToken,
    buyToken,
    sellAmount,
    buyAmount,
    quoteId,
    slippageBps = 0,
    env = 'prod',
  } = params

  log(`Limit order ${sellAmount} ${sellToken} for ${buyAmount} ${buyToken} on chain ${chainId}`)

  const signer = getSigner(params.signer)
  const orderBookApi = new OrderBookApi({ chainId, env })

  log('Building app data...')

  const appDataInfo = await buildAppData(
    {
      slippageBps,
      orderClass: 'limit',
      appCode,
    },
    advancedSettings?.appData
  )

  return postCoWProtocolTrade(orderBookApi, signer, appDataInfo, {
    ...params,
    quoteId,
    sellAmount,
    buyAmount,
  })
}