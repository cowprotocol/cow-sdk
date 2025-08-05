import { SupportedChainId } from '../../chains/types'
import { mapAddressToSupportedNetworks } from '../utils/config'

export const ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
export const EXTENSIBLE_FALLBACK_HANDLER = '0x2f55e8b20D0B9FEFA187AA7d00B6Cbe563605bF5'
export const COMPOSABLE_COW = '0xfdaFc9d1902f4e0b84f65F49f244b32b31013b74'

export const COW_SHED_1_0_0_VERSION = '1.0.0'
export const COW_SHED_LATEST_VERSION = '1.0.1'

export type CoWShedVersion = typeof COW_SHED_1_0_0_VERSION | typeof COW_SHED_LATEST_VERSION

// Per CoW Shed Version (COW_SHED_VERSION)
export const COW_SHED_FACTORY = {
  [COW_SHED_1_0_0_VERSION]: '0x00E989b87700514118Fa55326CD1cCE82faebEF6',
  [COW_SHED_LATEST_VERSION]: '0x312f92fe5f1710408B20D52A374fa29e099cFA86',
} as const
// Per CoW Shed Version (COW_SHED_VERSION)
export const COW_SHED_IMPLEMENTATION = {
  [COW_SHED_1_0_0_VERSION]: '0x2CFFA8cf11B90C9F437567b86352169dF4009F73',
  [COW_SHED_LATEST_VERSION]: '0xa2704cf562ad418bf0453f4b662ebf6a2489ed88',
} as const

const VAULT_RELAYER = '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110'
const SETTLEMENT_CONTRACT = '0x9008D19f58AAbD9eD0D60971565AA8510560ab41'

/**
 * An object containing the addresses of the CoW Protocol settlement contracts for each supported chain.
 */
export const COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS = mapAddressToSupportedNetworks(SETTLEMENT_CONTRACT)

/**
 * An object containing the addresses of the CoW Protocol Vault realyer contracts for each supported chain.
 */
export const COW_PROTOCOL_VAULT_RELAYER_ADDRESS = mapAddressToSupportedNetworks(VAULT_RELAYER)

/**
 * An object containing the addresses of the `ExtensibleFallbackHandler` contracts for each supported chain.
 */
export const EXTENSIBLE_FALLBACK_HANDLER_CONTRACT_ADDRESS = mapAddressToSupportedNetworks(EXTENSIBLE_FALLBACK_HANDLER)

/**
 * An object containing the addresses of the `ComposableCow` contracts for each supported chain.
 */
export const COMPOSABLE_COW_CONTRACT_ADDRESS = mapAddressToSupportedNetworks(COMPOSABLE_COW)

const ETH_FLOW_ADDRESS = '0xba3cb449bd2b4adddbc894d8697f5170800eadec'
const BARN_ETH_FLOW_ADDRESS = '0x04501b9b1d52e67f6862d157e00d13419d2d6e95'
// Lens does not uses the same deterministic address for the EthFlow contract as other chains.
const ETH_FLOW_ADDRESS_LENS = '0x5A5b8aE7a0b4C0EAf453d10DCcfbA413f07ebdC2'
const BARN_ETH_FLOW_ADDRESS_LENS = '0xFb337f8a725A142f65fb9ff4902d41cc901de222'

/**
 * An object containing the addresses of ETH flow contracts for each supported chain for production.
 */
export const ETH_FLOW_ADDRESSES: Record<SupportedChainId, string> = {
  ...mapAddressToSupportedNetworks(ETH_FLOW_ADDRESS),
  [SupportedChainId.LENS]: ETH_FLOW_ADDRESS_LENS,
}

/**
 * An object containing the addresses of ETH flow contracts for each supported chain for barn.
 */
export const BARN_ETH_FLOW_ADDRESSES: Record<SupportedChainId, string> = {
  ...mapAddressToSupportedNetworks(BARN_ETH_FLOW_ADDRESS),
  [SupportedChainId.LENS]: BARN_ETH_FLOW_ADDRESS_LENS,
}

export const MAX_VALID_TO_EPOCH = 4294967295 // Max uint32 (Feb 07 2106 07:28:15 GMT+0100)
