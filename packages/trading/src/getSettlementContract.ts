import { ContractFactory, SettlementContract, Signer } from '@cowprotocol/sdk-common'
import {
  COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS,
  COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_STAGING,
  ProtocolOptions,
  SupportedChainId,
} from '@cowprotocol/sdk-config'

export function getSettlementContract(
  chainId: SupportedChainId,
  signer: Signer,
  options?: ProtocolOptions,
): SettlementContract {
  return ContractFactory.createSettlementContract(getSettlementContractAddress(chainId, options), signer)
}

export function getSettlementContractAddress(chainId: SupportedChainId, options?: ProtocolOptions): string {
  const { env, settlementContractOverride } = options ?? {}

  return (
    settlementContractOverride?.[chainId] ??
    (env === 'staging'
      ? COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_STAGING[chainId]
      : COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[chainId])
  )
}
