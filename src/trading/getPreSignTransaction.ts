import { COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS, SupportedChainId } from '../common'
import type { Signer } from 'ethers'

import { GPv2Settlement__factory } from '../common/generated'
import { TransactionParams } from './types'

/**
 * For presign transactions it is not necessary to use a wallet provider
 * Because of that, provider might not support estimateGas method
 * setPreSignature() call is static enough, and we can expect the same gas spending
 * It usually takes 25700 gas, just in case I doubled it
 */
const PRE_SIGN_GAS_LIMIT = BigInt(50_000)

export async function getPreSignTransaction(
  signer: Signer,
  chainId: SupportedChainId,
  account: string,
  orderId: string
): Promise<TransactionParams> {
  const contract = GPv2Settlement__factory.connect(account, signer)

  const settlementContractAddress = COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[chainId] as `0x${string}`
  const preSignatureCall = contract.interface.encodeFunctionData('setPreSignature', [orderId, true])

  return {
    data: preSignatureCall,
    gas: '0x' + PRE_SIGN_GAS_LIMIT.toString(16),
    to: settlementContractAddress,
    value: '0',
  }
}
