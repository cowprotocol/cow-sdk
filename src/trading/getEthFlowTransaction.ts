import { LimitTradeParametersFromQuote, PostTradeAdditionalParams, TransactionParams } from './types'
import { calculateUniqueOrderId } from './calculateUniqueOrderId'
import { getOrderToSign } from './getOrderToSign'
import { type EthFlow, EthFlow__factory } from '../common/generated'
import { BARN_ETH_FLOW_ADDRESS, CowEnv, ETH_FLOW_ADDRESS } from '../common'
import { SupportedChainId } from '../chains'
import { GAS_LIMIT_DEFAULT } from './consts'
import type { EthFlowOrder } from '../common/generated/EthFlow'
import { adjustEthFlowOrderParams, calculateGasMargin } from './utils'
import { Signer } from '@ethersproject/abstract-signer'
import type { UnsignedOrder } from '../order-signing'

export async function getEthFlowTransaction(
  signer: Signer,
  appDataKeccak256: string,
  _params: LimitTradeParametersFromQuote,
  chainId: SupportedChainId,
  additionalParams: PostTradeAdditionalParams = {}
): Promise<{ orderId: string; transaction: TransactionParams; orderToSign: UnsignedOrder }> {
  const { networkCostsAmount = '0', checkEthFlowOrderExists } = additionalParams
  const from = await signer.getAddress()

  const params = {
    ..._params,
    ...adjustEthFlowOrderParams(chainId, _params),
  }
  const { quoteId } = params

  const contract = getEthFlowContract(signer, params.env)
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

  const data = contract.interface.encodeFunctionData('createOrder', [ethOrderParams])

  return {
    orderId,
    orderToSign,
    transaction: {
      data,
      gasLimit: '0x' + calculateGasMargin(estimatedGas).toString(16),
      to: contract.address,
      value: '0x' + BigInt(orderToSign.sellAmount).toString(16),
    },
  }
}

function getEthFlowContract(signer: Signer, env?: CowEnv): EthFlow {
  return EthFlow__factory.connect(env === 'staging' ? BARN_ETH_FLOW_ADDRESS : ETH_FLOW_ADDRESS, signer)
}
