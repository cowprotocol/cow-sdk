import { Signer } from 'ethers'
import { AppDataInfo, LimitOrderParameters } from './types'
import { calculateUniqueOrderId, EthFlowOrderExistsCallback } from './calculateUniqueOrderId'
import { getOrderToSign } from './getOrderToSign'
import { type EthFlow, EthFlow__factory } from '../common/generated'
import { ETH_FLOW_ADDRESSES, SupportedChainId } from '../common'
import { GAS_LIMIT_DEFAULT } from './consts'
import type { EthFlowOrder } from '../common/generated/EthFlow'

export async function postOnChainTrade(
  signer: Signer,
  appData: AppDataInfo,
  params: LimitOrderParameters,
  networkCostsAmount = '0',
  checkEthFlowOrderExists?: EthFlowOrderExistsCallback
): Promise<{ txHash: string; orderId: string }> {
  const { chainId, quoteId } = params
  const { fullAppData } = appData

  const from = await signer.getAddress()

  const contract = getEthFlowContract(chainId, signer)
  const orderToSign = getOrderToSign({ from, networkCostsAmount }, params, appData.appDataKeccak256)
  const orderId = await calculateUniqueOrderId(chainId, orderToSign, checkEthFlowOrderExists)

  const ethOrderParams: EthFlowOrder.DataStruct = {
    ...orderToSign,
    quoteId,
    appData: fullAppData,
    validTo: orderToSign.validTo.toString(),
  }

  const estimatedGas = await contract.estimateGas
    .createOrder(ethOrderParams, { value: orderToSign.sellAmount })
    .then((res) => BigInt(res.toHexString()))
    .catch((error) => {
      console.error(error)

      return GAS_LIMIT_DEFAULT
    })

  const txReceipt = await contract.createOrder(ethOrderParams, {
    value: orderToSign.sellAmount,
    gasLimit: calculateGasMargin(estimatedGas),
  })

  return { txHash: txReceipt.hash, orderId }
}

const ethFlowContractCache: Partial<Record<SupportedChainId, EthFlow | undefined>> = {}

function getEthFlowContract(chainId: SupportedChainId, signer: Signer): EthFlow {
  const cache = ethFlowContractCache[chainId]

  if (cache) return cache

  const contract = EthFlow__factory.connect(ETH_FLOW_ADDRESSES[chainId], signer)

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
