import { SupportedChainId, COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS } from '@cowprotocol/sdk-config'
import { Signer } from '@cowprotocol/sdk-common'
import { GAS_LIMIT_DEFAULT } from './consts'
import { calculateGasMargin } from './utils/misc'
import { ContractFactory } from '@cowprotocol/sdk-common'
import { TradingTransactionParams as TransactionParams } from './types'

export async function getPreSignTransaction(
  signer: Signer,
  chainId: SupportedChainId,
  account: string,
  orderId: string,
): Promise<TransactionParams> {
  const contract = ContractFactory.createSettlementContract(account, signer)
  const settlementContractAddress = COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[chainId]

  const preSignatureCall = contract.interface.encodeFunctionData('setPreSignature', [orderId, true])

  const gas =
    (await contract.estimateGas.setPreSignature?.(orderId, true).catch(() => GAS_LIMIT_DEFAULT)) || GAS_LIMIT_DEFAULT

  return {
    data: preSignatureCall,
    gasLimit: '0x' + calculateGasMargin(gas).toString(16),
    to: settlementContractAddress, // Para onde enviar a transação
    value: '0',
  }
}
