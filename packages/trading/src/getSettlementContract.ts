import { ContractFactory, SettlementContract, Signer } from '@cowprotocol/sdk-common'
import { COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS, SupportedEvmChainId } from '@cowprotocol/sdk-config'

export function getSettlementContract(chainId: SupportedEvmChainId, signer: Signer): SettlementContract {
  return ContractFactory.createSettlementContract(COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[chainId], signer)
}
