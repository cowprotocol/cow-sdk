import { Signer } from 'ethers'
import { LimitTradeParameters, TransactionParams } from './types'
import { calculateUniqueOrderId, EthFlowOrderExistsCallback } from './calculateUniqueOrderId'
import { getOrderToSign } from './getOrderToSign'
import { type EthFlow, EthFlow__factory } from '../common/generated'
import {
  BARN_ETH_FLOW_ADDRESSES,
  CowEnv,
  ETH_FLOW_ADDRESSES,
  SupportedChainId,
  WRAPPED_NATIVE_CURRENCIES,
} from '../common'
import { GAS_LIMIT_DEFAULT } from './consts'
import type { EthFlowOrder } from '../common/generated/EthFlow'

export async function getEthFlowTransaction(
  signer: Signer,
  appDataKeccak256: string,
  _params: LimitTradeParameters,
  networkCostsAmount = '0',
  checkEthFlowOrderExists?: EthFlowOrderExistsCallback
): Promise<{ orderId: string; transaction: TransactionParams }> {
  const chainId = (await signer.getChainId()) as SupportedChainId
  const from = await signer.getAddress()

  const params = {
    ..._params,
    sellToken: WRAPPED_NATIVE_CURRENCIES[chainId],
  }
  const { quoteId } = params

  const contract = getEthFlowContract(chainId, signer, params.env)
  const orderToSign = getOrderToSign({ from, networkCostsAmount }, params, appDataKeccak256)
  const orderId = await calculateUniqueOrderId(chainId, orderToSign, checkEthFlowOrderExists, params.env)

  const ethOrderParams: EthFlowOrder.DataStruct = {
    ...orderToSign,
    quoteId,
    appData: appDataKeccak256,
    validTo: orderToSign.validTo.toString(),
  }

  const estimatedGas = await contract.estimateGas
    .createOrder(ethOrderParams, { value: orderToSign.sellAmount })
    .then((res) => BigInt(res.toHexString()))
    .catch((error) => {
      console.error(error)

      return GAS_LIMIT_DEFAULT
    })

  const callData = contract.interface.encodeFunctionData('createOrder', [ethOrderParams])

  return {
    orderId,
    transaction: {
      callData,
      gasLimit: calculateGasMargin(estimatedGas).toString(),
      to: contract.address,
      value: orderToSign.sellAmount,
    },
  }
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
