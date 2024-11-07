import { OrderBookApi, OrderCreation } from '../order-book'
import type { Signer } from 'ethers'
import { AppDataInfo, LimitOrderParameters } from './types'
import { log, SIGN_SCHEME_MAP } from './consts'
import { OrderSigningUtils } from '../order-signing'
import { getOrderToSign } from './getOrderToSign'
import { ETH_ADDRESS } from '../common'
import { postOnChainTrade } from './postOnChainTrade'

export async function postCoWProtocolTrade(
  orderBookApi: OrderBookApi,
  signer: Signer,
  appData: AppDataInfo,
  params: LimitOrderParameters,
  networkCostsAmount = '0'
): Promise<string> {
  const isEthFlowOrder = params.sellToken.toLowerCase() === ETH_ADDRESS.toLowerCase()

  if (isEthFlowOrder) {
    const { orderId } = await postOnChainTrade(signer, appData, params, networkCostsAmount)

    return orderId
  }

  const { chainId, quoteId = null } = params
  const { appDataKeccak256, fullAppData } = appData

  const from = await signer.getAddress()

  const orderToSign = getOrderToSign({ from, networkCostsAmount }, params, appData)

  log('Signing order...')

  const { signature, signingScheme } = await OrderSigningUtils.signOrder(orderToSign, chainId, signer)

  const orderBody: OrderCreation = {
    ...orderToSign,
    from,
    signature,
    signingScheme: SIGN_SCHEME_MAP[signingScheme],
    quoteId,
    appData: fullAppData,
    appDataHash: appDataKeccak256,
  }

  log('Posting order...')

  const orderId = await orderBookApi.sendOrder(orderBody)

  log(`Order created, id: ${orderId}`)

  return orderId
}
