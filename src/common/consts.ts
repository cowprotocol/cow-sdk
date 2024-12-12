import { SupportedChainId } from './chains'

export const ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
export const EXTENSIBLE_FALLBACK_HANDLER = '0x2f55e8b20D0B9FEFA187AA7d00B6Cbe563605bF5'
export const COMPOSABLE_COW = '0xfdaFc9d1902f4e0b84f65F49f244b32b31013b74'

export const COW_SHED_FACTORY = '0x00E989b87700514118Fa55326CD1cCE82faebEF6'
export const COW_SHED_IMPLEMENTATION = '0x2CFFA8cf11B90C9F437567b86352169dF4009F73'

const VAULT_RELAYER = '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110'
const SETTLEMENT_CONTRACT = '0x9008D19f58AAbD9eD0D60971565AA8510560ab41'

/**
 * The list of supported chains.
 */
export const ALL_SUPPORTED_CHAIN_IDS: SupportedChainId[] = Object.values(SupportedChainId).filter(
  (chainId) => typeof chainId === 'number'
) as SupportedChainId[]

export function mapSupportedNetworks<T>(value: (chainId: SupportedChainId) => T): Record<SupportedChainId, T>
export function mapSupportedNetworks<T>(value: T): Record<SupportedChainId, T>
export function mapSupportedNetworks<T>(value: T | ((chainId: SupportedChainId) => T)): Record<SupportedChainId, T> {
  return ALL_SUPPORTED_CHAIN_IDS.reduce<Record<number, T>>(
    (acc, chainId) => ({
      ...acc,
      [chainId]: typeof value === 'function' ? (value as (chainId: SupportedChainId) => T)(chainId) : value,
    }),
    {}
  )
}

export function mapAddressToSupportedNetworks(address: string): Record<SupportedChainId, string> {
  return mapSupportedNetworks(address)
}

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

/**
 * An object containing the addresses of wrapped native currencies for each supported chain.
 */
export const WRAPPED_NATIVE_CURRENCIES: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  [SupportedChainId.GNOSIS_CHAIN]: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d',
  [SupportedChainId.ARBITRUM_ONE]: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
  [SupportedChainId.SEPOLIA]: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
  [SupportedChainId.BASE]: '0x4200000000000000000000000000000000000006',
}

/**
 * An object containing the addresses of ETH flow contracts for each supported chain.
 */
export const ETH_FLOW_ADDRESSES: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: '0x40A50cf069e992AA4536211B23F286eF88752187',
  [SupportedChainId.GNOSIS_CHAIN]: '0x40A50cf069e992AA4536211B23F286eF88752187',
  [SupportedChainId.ARBITRUM_ONE]: '0x552fcecc218158fff20e505c8f3ad24f8e1dd33c',
  [SupportedChainId.SEPOLIA]: '0x0b7795E18767259CC253a2dF471db34c72B49516',
  [SupportedChainId.BASE]: '0x3d1b389f1707DB3d4c5344d5669DBda6b5D6Ab51',
}

export const BARN_ETH_FLOW_ADDRESSES: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: '0xD02De8Da0B71E1B59489794F423FaBBa2AdC4d93',
  [SupportedChainId.GNOSIS_CHAIN]: '0xD02De8Da0B71E1B59489794F423FaBBa2AdC4d93',
  [SupportedChainId.ARBITRUM_ONE]: '0x6dfe75b5ddce1ade279d4fa6bd6aef3cbb6f49db',
  [SupportedChainId.SEPOLIA]: '0x2671994c7D224ac4799ac2cf6Ef9EF187d42C69f',
  [SupportedChainId.BASE]: '0x3C3eA1829891BC9bEC3d06A81d5d169e52a415e3',
}

export const MAX_VALID_TO_EPOCH = 4294967295 // Max uint32 (Feb 07 2106 07:28:15 GMT+0100)
