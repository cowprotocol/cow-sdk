import { OrderBookApi, OrderCreation } from '../order-book'
import type { Signer } from 'ethers'
import { AppDataInfo, LimitOrderParameters } from './types'
import { log, SIGN_SCHEME_MAP } from './consts'
import { OrderSigningUtils } from '../order-signing'
import { getOrderToSign } from './getOrderToSign'
import { postOnChainTrade } from './postOnChainTrade'
import { getIsEthFlowOrder } from './utils'

export async function postCoWProtocolTrade(
  orderBookApi: OrderBookApi,
  signer: Signer,
  appData: AppDataInfo,
  params: LimitOrderParameters,
  networkCostsAmount = '0'
): Promise<string> {
  if (getIsEthFlowOrder(params)) {
    const { orderId } = await postOnChainTrade(orderBookApi, signer, appData, params, networkCostsAmount)

    return orderId
  }

  const { chainId, quoteId = null } = params
  const { appDataKeccak256, fullAppData } = appData

  const from = await signer.getAddress()

  const orderToSign = getOrderToSign({ from, networkCostsAmount }, params, appData.appDataKeccak256)

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
