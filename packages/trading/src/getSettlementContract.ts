import { ContractFactory, SettlementContract, Signer } from '@cowprotocol/sdk-common'
import {
  COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS,
  COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_STAGING,
  CowEnv,
  SupportedChainId,
} from '@cowprotocol/sdk-config'

export function getSettlementContract(chainId: SupportedChainId, signer: Signer, env?: CowEnv): SettlementContract {
  return ContractFactory.createSettlementContract(
    env === 'staging'
      ? COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_STAGING[chainId]
      : COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[chainId],
    signer,
  )
}
