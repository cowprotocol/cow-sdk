import { mapAddressToSupportedNetworks } from './utils'
import { AdditionalTargetChainId, ChainInfo, SupportedChainId } from '../types'
import { mainnet } from '../details/mainnet'
import { gnosisChain } from '../details/gnosis'
import { arbitrumOne } from '../details/arbitrum'
import { base } from '../details/base'
import { sepolia } from '../details/sepolia'
import { avalanche } from '../details/avalanche'
import { optimism } from '../details/optimism'
import { polygon } from '../details/polygon'

export const ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
export const EXTENSIBLE_FALLBACK_HANDLER = '0x2f55e8b20D0B9FEFA187AA7d00B6Cbe563605bF5'
export const COMPOSABLE_COW = '0xfdaFc9d1902f4e0b84f65F49f244b32b31013b74'
export const COW_SHED_FACTORY = '0x00E989b87700514118Fa55326CD1cCE82faebEF6'
export const COW_SHED_IMPLEMENTATION = '0x2CFFA8cf11B90C9F437567b86352169dF4009F73'

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

export const ETH_FLOW_ADDRESS = '0xba3cb449bd2b4adddbc894d8697f5170800eadec'
export const BARN_ETH_FLOW_ADDRESS = '0x04501b9b1d52e67f6862d157e00d13419d2d6e95'

/**
 * An object containing the addresses of ETH flow contracts for each supported chain.
 * @deprecated use ETH_FLOW_ADDRESS instead
 */
export const ETH_FLOW_ADDRESSES: Record<SupportedChainId, string> = mapAddressToSupportedNetworks(ETH_FLOW_ADDRESS)

/**
 * @deprecated use BARN_ETH_FLOW_ADDRESS instead
 */
export const BARN_ETH_FLOW_ADDRESSES: Record<SupportedChainId, string> =
  mapAddressToSupportedNetworks(BARN_ETH_FLOW_ADDRESS)

export const MAX_VALID_TO_EPOCH = 4294967295 // Max uint32 (Feb 07 2106 07:28:15 GMT+0100)

/**
 * Details of all supported chains.
 */
export const ALL_SUPPORTED_CHAINS_MAP: Record<SupportedChainId, ChainInfo> = {
  [SupportedChainId.MAINNET]: mainnet,
  [SupportedChainId.GNOSIS_CHAIN]: gnosisChain,
  [SupportedChainId.ARBITRUM_ONE]: arbitrumOne,
  [SupportedChainId.BASE]: base,
  [SupportedChainId.AVALANCHE]: avalanche,
  [SupportedChainId.POLYGON]: polygon,
  [SupportedChainId.SEPOLIA]: sepolia,
}

/**
 * All supported chains.
 */
export const ALL_SUPPORTED_CHAINS = Object.values(ALL_SUPPORTED_CHAINS_MAP)

/**
 * Maps a chain where you can bridge to, but not sell tokens from (not supported by CoW Protocol)
 */
export const ADDITIONAL_TARGET_CHAINS_MAP: Record<AdditionalTargetChainId, ChainInfo> = {
  [AdditionalTargetChainId.OPTIMISM]: optimism,
}

/**
 * All chains (both supported by CoW Protocol, or chains where you can bridge to)
 */
export const ALL_CHAINS = ALL_SUPPORTED_CHAINS.concat(Object.values(ADDITIONAL_TARGET_CHAINS_MAP))

/**
 * All chain ids (both supported by CoW Protocol, or chains where you can bridge to)
 */
export const ALL_CHAINS_IDS = ALL_CHAINS.map((chain) => chain.id)
