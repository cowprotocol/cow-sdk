import { COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS } from '../common'
import { SupportedChainId } from '../chains'
import type { Signer } from '@ethersproject/abstract-signer'
import { GAS_LIMIT_DEFAULT } from './consts'
import { calculateGasMargin } from './utils/misc'

import { GPv2Settlement__factory } from '../common/generated'
import { TransactionParams } from './types'

export async function getPreSignTransaction(
  signer: Signer,
  chainId: SupportedChainId,
  account: string,
  orderId: string,
): Promise<TransactionParams> {
  const contract = GPv2Settlement__factory.connect(account, signer)

  const settlementContractAddress = COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[chainId] as `0x${string}`
  const preSignatureCall = contract.interface.encodeFunctionData('setPreSignature', [orderId, true])

  const gas = await contract.estimateGas
    .setPreSignature(orderId, true)
    .then((res) => BigInt(res.toHexString()))
    .catch(() => {
      return GAS_LIMIT_DEFAULT
    })

  return {
    data: preSignatureCall,
    gasLimit: '0x' + calculateGasMargin(gas).toString(16),
    to: settlementContractAddress,
    value: '0',
  }
}
