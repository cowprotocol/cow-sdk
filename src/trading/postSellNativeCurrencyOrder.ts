import { Signer } from 'ethers'
import { AppDataInfo, LimitTradeParametersFromQuote } from './types'
import { EthFlowOrderExistsCallback } from './calculateUniqueOrderId'

import { log } from './consts'
import { OrderBookApi } from '../order-book'
import { getEthFlowTransaction } from './getEthFlowTransaction'

export async function postSellNativeCurrencyOrder(
  orderBookApi: OrderBookApi,
  signer: Signer,
  appData: Pick<AppDataInfo, 'fullAppData' | 'appDataKeccak256'>,
  _params: LimitTradeParametersFromQuote,
  networkCostsAmount = '0',
  checkEthFlowOrderExists?: EthFlowOrderExistsCallback
): Promise<{ txHash: string; orderId: string }> {
  const { appDataKeccak256, fullAppData } = appData

  const { orderId, transaction } = await getEthFlowTransaction(
    signer,
    appDataKeccak256,
    _params,
    networkCostsAmount,
    checkEthFlowOrderExists
  )

  log('Uploading app-data')
  await orderBookApi.uploadAppData(appDataKeccak256, fullAppData)

  log('Sending on-chain order transaction')
  const txReceipt = await signer.sendTransaction(transaction)

  log(`On-chain order transaction sent, txHash: ${txReceipt.hash}, order: ${orderId}`)
  return { txHash: txReceipt.hash, orderId }
}
