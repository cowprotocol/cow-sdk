import { Signer } from 'ethers'
import { AppDataInfo, LimitOrderParameters } from './types'
import { calculateUniqueOrderId, EthFlowOrderExistsCallback } from './calculateUniqueOrderId'
import { getOrderToSign } from './getOrderToSign'
import { type EthFlow, EthFlow__factory } from '../common/generated'
import { BARN_ETH_FLOW_ADDRESSES, CowEnv, ETH_FLOW_ADDRESSES, SupportedChainId } from '../common'
import { GAS_LIMIT_DEFAULT, log } from './consts'
import type { EthFlowOrder } from '../common/generated/EthFlow'
import { OrderBookApi } from '../order-book'

export async function postOnChainTrade(
  orderBookApi: OrderBookApi,
  signer: Signer,
  appData: Pick<AppDataInfo, 'fullAppData' | 'appDataKeccak256'>,
  params: LimitOrderParameters,
  networkCostsAmount = '0',
  checkEthFlowOrderExists?: EthFlowOrderExistsCallback
): Promise<{ txHash: string; orderId: string }> {
  const { chainId, quoteId } = params
  const { appDataKeccak256, fullAppData } = appData

  const from = await signer.getAddress()

  const contract = getEthFlowContract(chainId, signer, params.env)
  const orderToSign = getOrderToSign({ from, networkCostsAmount }, params, appDataKeccak256)
  const orderId = await calculateUniqueOrderId(chainId, orderToSign, checkEthFlowOrderExists, params.env)

  const ethOrderParams: EthFlowOrder.DataStruct = {
    ...orderToSign,
    quoteId,
    appData: appDataKeccak256,
    validTo: orderToSign.validTo.toString(),
  }

  log('Uploading app-data')
  await orderBookApi.uploadAppData(appDataKeccak256, fullAppData)

  log('Estimating on-chain order gas')
  const estimatedGas = await contract.estimateGas
    .createOrder(ethOrderParams, { value: orderToSign.sellAmount })
    .then((res) => BigInt(res.toHexString()))
    .catch((error) => {
      console.error(error)

      return GAS_LIMIT_DEFAULT
    })

  log('Sending on-chain order transaction')
  const txReceipt = await contract.createOrder(ethOrderParams, {
    value: orderToSign.sellAmount,
    gasLimit: calculateGasMargin(estimatedGas),
  })

  log(`On-chain order transaction sent, txHash: ${txReceipt.hash}, order: ${orderId}`)
  return { txHash: txReceipt.hash, orderId }
}

const ethFlowContractCache: Partial<Record<SupportedChainId, EthFlow | undefined>> = {}

function getEthFlowContract(chainId: SupportedChainId, signer: Signer, env?: CowEnv): EthFlow {
  const cache = ethFlowContractCache[chainId]

  if (cache) return cache

  const contract = EthFlow__factory.connect(
    (env === 'staging' ? BARN_ETH_FLOW_ADDRESSES : ETH_FLOW_ADDRESSES)[chainId],
    signer
  )

  ethFlowContractCache[chainId] = contract

  return contract
}

/**
 * Returns the gas value plus a margin for unexpected or variable gas costs (20%)
 * @param value the gas value to pad
 */
function calculateGasMargin(value: bigint): bigint {
  return value + (value * BigInt(20)) / BigInt(100)
}
