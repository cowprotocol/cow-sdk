import { SupportedEvmChainId } from '@cowprotocol/sdk-config'
import { Signer } from '@cowprotocol/sdk-common'
import { GAS_LIMIT_DEFAULT } from './consts'
import { calculateGasMargin } from './utils/misc'
import { TradingTransactionParams as TransactionParams } from './types'
import { getSettlementContract } from './getSettlementContract'

export async function getPreSignTransaction(
  signer: Signer,
  chainId: SupportedEvmChainId,
  orderId: string,
): Promise<TransactionParams> {
  const contract = getSettlementContract(chainId, signer)

  const preSignatureCall = contract.interface.encodeFunctionData('setPreSignature', [orderId, true])

  const gas =
    (await contract.estimateGas.setPreSignature?.(orderId, true).catch(() => GAS_LIMIT_DEFAULT)) || GAS_LIMIT_DEFAULT

  return {
    data: preSignatureCall,
    gasLimit: '0x' + calculateGasMargin(gas).toString(16),
    to: contract.address,
    value: '0',
  }
}
