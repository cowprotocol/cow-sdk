import { LimitTradeParametersFromQuote, PostTradeAdditionalParams, TransactionParams } from './types'
import { calculateUniqueOrderId } from './calculateUniqueOrderId'
import { getOrderToSign } from './getOrderToSign'
import { SupportedChainId, BARN_ETH_FLOW_ADDRESS, CowEnv, ETH_FLOW_ADDRESS } from '@cowprotocol/sdk-config'
import { GAS_LIMIT_DEFAULT } from './consts'
import { adjustEthFlowOrderParams, calculateGasMargin } from './utils/misc'
import {
  getGlobalAdapter,
  Signer,
  ContractFactory,
  EthFlowContract,
  EthFlowOrderData,
  SignerLike,
} from '@cowprotocol/sdk-common'
import type { UnsignedOrder } from '@cowprotocol/sdk-order-signing'

export async function getEthFlowTransaction(
  paramSigner: SignerLike | undefined,
  appDataKeccak256: string,
  _params: LimitTradeParametersFromQuote,
  chainId: SupportedChainId,
  additionalParams: PostTradeAdditionalParams = {},
): Promise<{ orderId: string; transaction: TransactionParams; orderToSign: UnsignedOrder }> {
  const signer = paramSigner ? getGlobalAdapter().createSigner(paramSigner) : getGlobalAdapter().signer

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

  const ethOrderParams: EthFlowOrderData = {
    buyToken: orderToSign.buyToken,
    receiver: orderToSign.receiver,
    sellAmount: orderToSign.sellAmount,
    buyAmount: orderToSign.buyAmount,
    feeAmount: orderToSign.feeAmount,
    partiallyFillable: orderToSign.partiallyFillable,
    quoteId,
    appData: appDataKeccak256,
    validTo: orderToSign.validTo.toString(),
  }

  const estimatedGas =
    (await contract.estimateGas.createOrder?.(ethOrderParams, { value: orderToSign.sellAmount }).catch((error: any) => {
      console.error(error)

      return GAS_LIMIT_DEFAULT
    })) || GAS_LIMIT_DEFAULT

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

export function getEthFlowContract(signer: Signer, env?: CowEnv): EthFlowContract {
  const address = env === 'staging' ? BARN_ETH_FLOW_ADDRESS : ETH_FLOW_ADDRESS
  return ContractFactory.createEthFlowContract(address, signer)
}
