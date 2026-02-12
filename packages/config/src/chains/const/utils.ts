import { ALL_SUPPORTED_CHAIN_IDS } from './chainIds'
import { SupportedEvmChainId } from '../types'

export function mapSupportedNetworks<T>(value: (chainId: SupportedEvmChainId) => T): Record<SupportedEvmChainId, T>
export function mapSupportedNetworks<T>(value: T): Record<SupportedEvmChainId, T>
export function mapSupportedNetworks<T>(value: T | ((chainId: SupportedEvmChainId) => T)): Record<SupportedEvmChainId, T> {
  return ALL_SUPPORTED_CHAIN_IDS.reduce<Record<number, T>>(
    (acc, chainId) => ({
      ...acc,
      [chainId]: typeof value === 'function' ? (value as (chainId: SupportedEvmChainId) => T)(chainId) : value,
    }),
    {},
  )
}

export function mapAddressToSupportedNetworks(address: string): Record<SupportedEvmChainId, string> {
  return mapSupportedNetworks(address)
}
