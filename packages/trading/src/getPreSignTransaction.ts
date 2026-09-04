import { ProtocolOptions, SupportedChainId } from '@cowprotocol/sdk-config'
import { Signer } from '@cowprotocol/sdk-common'
import { GAS_LIMIT_DEFAULT } from './consts'
import { calculateGasMargin } from './utils/misc'
import { TradingTransactionParams as TransactionParams } from './types'
import { getSettlementContract } from './getSettlementContract'
import { getPreSignCallData } from './getPreSignCallData'

export async function getPreSignTransaction(
  signer: Signer,
  chainId: SupportedChainId,
  orderId: string,
  options?: ProtocolOptions,
): Promise<TransactionParams> {
  const contract = getSettlementContract(chainId, signer, options)
  const callData = getPreSignCallData(chainId, orderId, options)

  const gas =
    (await contract.estimateGas.setPreSignature?.(orderId, true).catch(() => GAS_LIMIT_DEFAULT)) || GAS_LIMIT_DEFAULT

  return {
    ...callData,
    gasLimit: '0x' + calculateGasMargin(gas).toString(16),
  }
}
