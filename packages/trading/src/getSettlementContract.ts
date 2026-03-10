import { ContractFactory, SettlementContract, Signer } from '@cowprotocol/sdk-common'
import {
  AddressPerChain,
  COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS,
  COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_STAGING,
  CowEnv,
  SupportedChainId,
} from '@cowprotocol/sdk-config'

export function getSettlementContract(
  chainId: SupportedChainId,
  signer: Signer,
  env?: CowEnv,
  settlementContractOverride?: AddressPerChain,
): SettlementContract {
  return ContractFactory.createSettlementContract(
    settlementContractOverride?.[chainId] ??
      (env === 'staging'
        ? COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_STAGING[chainId]
        : COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[chainId]),
    signer,
  )
}
