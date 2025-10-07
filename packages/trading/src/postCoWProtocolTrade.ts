import { OrderBookApi, OrderCreation, SigningScheme } from '@cowprotocol/sdk-order-book'
import { TradingAppDataInfo, LimitTradeParameters, OrderPostingResult, PostTradeAdditionalParams } from './types'
import { SIGN_SCHEME_MAP } from './consts'
import { OrderSigningUtils } from '@cowprotocol/sdk-order-signing'
import { getOrderToSign } from './getOrderToSign'
import { postSellNativeCurrencyOrder } from './postSellNativeCurrencyOrder'
import { getIsEthFlowOrder } from './utils/misc'
import { log, SignerLike } from '@cowprotocol/sdk-common'
import { resolveSigner } from './utils/resolveSigner'

export async function postCoWProtocolTrade(
  orderBookApi: OrderBookApi,
  appData: TradingAppDataInfo,
  params: LimitTradeParameters,
  additionalParams: PostTradeAdditionalParams = {},
  paramSigner?: SignerLike,
): Promise<OrderPostingResult> {
  const signer = resolveSigner(paramSigner)
  const { networkCostsAmount = '0', signingScheme: _signingScheme = SigningScheme.EIP712 } = additionalParams

  const isEthFlow = getIsEthFlowOrder(params)

  if (isEthFlow) {
    const quoteId = params.quoteId

    if (typeof quoteId === 'number') {
      return postSellNativeCurrencyOrder(orderBookApi, appData, { ...params, quoteId }, additionalParams, paramSigner)
    } else {
      throw new Error('quoteId is required for EthFlow orders')
    }
  }

  const { quoteId = null, owner } = params
  const { appDataKeccak256, fullAppData } = appData

  const chainId = orderBookApi.context.chainId
  const from = owner || (await signer.getAddress())
  const orderToSign = getOrderToSign({ chainId, from, networkCostsAmount, isEthFlow }, params, appData.appDataKeccak256)

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
