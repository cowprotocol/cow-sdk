import { getGlobalAdapter, SignerLike } from '@cowprotocol/sdk-common'
import { AppDataInfo, LimitTradeParametersFromQuote, OrderPostingResult, PostTradeAdditionalParams } from './types'

import { OrderBookApi, SigningScheme } from '@cowprotocol/sdk-order-book'
import { getEthFlowTransaction } from './getEthFlowTransaction'

import { log } from '@cowprotocol/sdk-common'

export async function postSellNativeCurrencyOrder(
  orderBookApi: OrderBookApi,
  appData: Pick<AppDataInfo, 'fullAppData' | 'appDataKeccak256'>,
  _params: LimitTradeParametersFromQuote,
  additionalParams: PostTradeAdditionalParams = {},
  paramSigner?: SignerLike,
): Promise<OrderPostingResult> {
  const signer = paramSigner ? getGlobalAdapter().createSigner(paramSigner) : getGlobalAdapter().signer

  const { appDataKeccak256, fullAppData } = appData

  const { orderId, transaction, orderToSign } = await getEthFlowTransaction(
    appDataKeccak256,
    _params,
    orderBookApi.context.chainId,
    additionalParams,
    signer,
  )

  log('Uploading app-data')
  await orderBookApi.uploadAppData(appDataKeccak256, fullAppData)

  log('Sending on-chain order transaction')
  const txReceipt = await signer.sendTransaction(transaction)

  log(`On-chain order transaction sent, txHash: ${txReceipt.hash}, order: ${orderId}`)
  return { txHash: txReceipt.hash, orderId, orderToSign, signature: '', signingScheme: SigningScheme.EIP1271 }
}
