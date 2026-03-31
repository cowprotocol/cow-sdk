import { getAddressKey } from './address'
import {
  COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS,
  COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_STAGING,
  COW_PROTOCOL_VAULT_RELAYER_ADDRESS,
  COW_PROTOCOL_VAULT_RELAYER_ADDRESS_STAGING,
  SupportedChainId,
} from '@cowprotocol/sdk-config'
import { areAddressesEqual } from './token'

export function isCoWSettlementContract(_address: string, chainId: SupportedChainId): boolean {
  const address = getAddressKey(_address)

  return (
    areAddressesEqual(COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[chainId], address) ||
    areAddressesEqual(COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_STAGING[chainId], address)
  )
}

export function isCoWVaultRelayerContract(_address: string, chainId: SupportedChainId): boolean {
  const address = getAddressKey(_address)

  return (
    areAddressesEqual(COW_PROTOCOL_VAULT_RELAYER_ADDRESS[chainId], address) ||
    areAddressesEqual(COW_PROTOCOL_VAULT_RELAYER_ADDRESS_STAGING[chainId], address)
  )
}
