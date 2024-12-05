import { OrderBookApi, OrderCreation } from '../order-book'
import type { Signer } from 'ethers'
import { AppDataInfo, LimitTradeParameters } from './types'
import { log, SIGN_SCHEME_MAP } from './consts'
import { OrderSigningUtils } from '../order-signing'
import { getOrderToSign } from './getOrderToSign'
import { postSellNativeCurrencyOrder } from './postSellNativeCurrencyOrder'
import { getIsEthFlowOrder } from './utils'

export async function postCoWProtocolTrade(
  orderBookApi: OrderBookApi,
  signer: Signer,
  appData: AppDataInfo,
  params: LimitTradeParameters,
  networkCostsAmount = '0'
): Promise<string> {
  if (getIsEthFlowOrder(params)) {
    const quoteId = params.quoteId

    if (typeof quoteId === 'number') {
      const { orderId } = await postSellNativeCurrencyOrder(
        orderBookApi,
        signer,
        appData,
        { ...params, quoteId },
        networkCostsAmount
      )

      return orderId
    } else {
      throw new Error('quoteId is required for EthFlow orders')
    }
  }

  const { quoteId = null } = params
  const { appDataKeccak256, fullAppData } = appData

  const chainId = await signer.getChainId()
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
