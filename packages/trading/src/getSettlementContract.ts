import { ContractFactory, SettlementContract, Signer } from '@cowprotocol/sdk-common'
import { COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS, SupportedChainId } from '@cowprotocol/sdk-config'

export function getSettlementContract(chainId: SupportedChainId, signer: Signer): SettlementContract {
  return ContractFactory.createSettlementContract(COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[chainId], signer)
}
