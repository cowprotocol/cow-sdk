import { Signer } from 'ethers'
import { AppDataInfo, LimitTradeParametersFromQuote, OrderPostingResult, PostTradeAdditionalParams } from './types'

import { OrderBookApi, SigningScheme } from '../order-book'
import { getEthFlowTransaction } from './getEthFlowTransaction'

import { log } from '../common/utils/log'

export async function postSellNativeCurrencyOrder(
  orderBookApi: OrderBookApi,
  signer: Signer,
  appData: Pick<AppDataInfo, 'fullAppData' | 'appDataKeccak256'>,
  _params: LimitTradeParametersFromQuote,
  additionalParams: PostTradeAdditionalParams = {},
): Promise<OrderPostingResult> {
  const { appDataKeccak256, fullAppData } = appData

  const { orderId, transaction, orderToSign } = await getEthFlowTransaction(
    signer,
    appDataKeccak256,
    _params,
    orderBookApi.context.chainId,
    additionalParams,
  )

  log('Uploading app-data')
  await orderBookApi.uploadAppData(appDataKeccak256, fullAppData)

  log('Sending on-chain order transaction')
  const txReceipt = await signer.sendTransaction(transaction)

  log(`On-chain order transaction sent, txHash: ${txReceipt.hash}, order: ${orderId}`)
  return { txHash: txReceipt.hash, orderId, orderToSign, signature: '', signingScheme: SigningScheme.EIP1271 }
}
