import { OrderBookApi, OrderCreation, SigningScheme } from '../order-book'
import type { Signer } from '@ethersproject/abstract-signer'
import { AppDataInfo, LimitTradeParameters, OrderPostingResult, PostTradeAdditionalParams } from './types'
import { SIGN_SCHEME_MAP } from './consts'
import { OrderSigningUtils } from '../order-signing'
import { getOrderToSign } from './getOrderToSign'
import { postSellNativeCurrencyOrder } from './postSellNativeCurrencyOrder'
import { getIsEthFlowOrder } from './utils/misc'
import { log } from '../common/utils/log'

export async function postCoWProtocolTrade(
  orderBookApi: OrderBookApi,
  signer: Signer,
  appData: AppDataInfo,
  params: LimitTradeParameters,
  additionalParams: PostTradeAdditionalParams = {},
): Promise<OrderPostingResult> {
  const { networkCostsAmount = '0', signingScheme: _signingScheme = SigningScheme.EIP712 } = additionalParams

  if (getIsEthFlowOrder(params)) {
    const quoteId = params.quoteId

    if (typeof quoteId === 'number') {
      return postSellNativeCurrencyOrder(orderBookApi, signer, appData, { ...params, quoteId }, additionalParams)
    } else {
      throw new Error('quoteId is required for EthFlow orders')
    }
  }

  const { quoteId = null, owner } = params
  const { appDataKeccak256, fullAppData } = appData

  const chainId = orderBookApi.context.chainId
  const from = owner || (await signer.getAddress())
  const orderToSign = getOrderToSign({ from, networkCostsAmount }, params, appData.appDataKeccak256)

  log('Signing order...')

  const { signature, signingScheme } = await (async () => {
    if (_signingScheme === SigningScheme.PRESIGN) {
      return { signature: from, signingScheme: SigningScheme.PRESIGN }
    } else {
      const signingResult = await OrderSigningUtils.signOrder(orderToSign, chainId, signer)

      return { signature: signingResult.signature, signingScheme: SIGN_SCHEME_MAP[signingResult.signingScheme] }
    }
  })()

  const orderBody: OrderCreation = {
    ...orderToSign,
    from,
    signature,
    signingScheme,
    quoteId,
    appData: fullAppData,
    appDataHash: appDataKeccak256,
  }

  log('Posting order...')

  const orderId = await orderBookApi.sendOrder(orderBody)

  log(`Order created, id: ${orderId}`)

  return { orderId, signature, signingScheme, orderToSign }
}
