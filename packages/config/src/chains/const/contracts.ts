import { mapAddressToSupportedNetworks } from './utils'
import { SupportedChainId } from '../types'

export const ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
export const EXTENSIBLE_FALLBACK_HANDLER = '0x2f55e8b20D0B9FEFA187AA7d00B6Cbe563605bF5'
export const COMPOSABLE_COW = '0xfdaFc9d1902f4e0b84f65F49f244b32b31013b74'

const VAULT_RELAYER = '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110'
const VAULT_RELAYER_STAGING = '0xC7242d167563352E2BCA4d71C043fbe542DB8FB2'
const SETTLEMENT_CONTRACT = '0x9008D19f58AAbD9eD0D60971565AA8510560ab41'
const SETTLEMENT_CONTRACT_STAGING = '0xf553d092b50bdcbddeD1A99aF2cA29FBE5E2CB13'

/**
 * An object containing the addresses of the CoW Protocol settlement contracts for each supported chain.
 */
export const COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS = mapAddressToSupportedNetworks(SETTLEMENT_CONTRACT)
export const COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_STAGING =
  mapAddressToSupportedNetworks(SETTLEMENT_CONTRACT_STAGING)

/**
 * An object containing the addresses of the CoW Protocol Vault realyer contracts for each supported chain.
 */
export const COW_PROTOCOL_VAULT_RELAYER_ADDRESS = mapAddressToSupportedNetworks(VAULT_RELAYER)
export const COW_PROTOCOL_VAULT_RELAYER_ADDRESS_STAGING = mapAddressToSupportedNetworks(VAULT_RELAYER_STAGING)

/**
 * An object containing the addresses of the `ExtensibleFallbackHandler` contracts for each supported chain.
 */
export const EXTENSIBLE_FALLBACK_HANDLER_CONTRACT_ADDRESS = mapAddressToSupportedNetworks(EXTENSIBLE_FALLBACK_HANDLER)

/**
 * An object containing the addresses of the `ComposableCow` contracts for each supported chain.
 */
export const COMPOSABLE_COW_CONTRACT_ADDRESS = mapAddressToSupportedNetworks(COMPOSABLE_COW)

const ETH_FLOW_ADDRESS = '0xba3cb449bd2b4adddbc894d8697f5170800eadec'
const BARN_ETH_FLOW_ADDRESS = '0xb37aDD6AC288BD3825a901Cba6ec65A89f31B8CC'

/**
 * An object containing the addresses of ETH flow contracts for each supported chain for production.
 */
export const ETH_FLOW_ADDRESSES: Record<SupportedChainId, string> = mapAddressToSupportedNetworks(ETH_FLOW_ADDRESS)

/**
 * An object containing the addresses of ETH flow contracts for each supported chain for barn.
 */
export const BARN_ETH_FLOW_ADDRESSES: Record<SupportedChainId, string> = mapAddressToSupportedNetworks(BARN_ETH_FLOW_ADDRESS)

export const MAX_VALID_TO_EPOCH = 4294967295 // Max uint32 (Feb 07 2106 07:28:15 GMT+0100)
