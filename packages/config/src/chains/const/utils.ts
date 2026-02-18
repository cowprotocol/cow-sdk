import { ALL_CHAINS_IDS, ALL_SUPPORTED_CHAIN_IDS } from './chainIds'
import { SupportedChainId, TargetChainId } from '../types'

export function mapSupportedNetworks<T>(value: (chainId: SupportedChainId) => T): Record<SupportedChainId, T>
export function mapSupportedNetworks<T>(value: T): Record<SupportedChainId, T>
export function mapSupportedNetworks<T>(value: T | ((chainId: SupportedChainId) => T)): Record<SupportedChainId, T> {
  return ALL_SUPPORTED_CHAIN_IDS.reduce<Record<number, T>>(
    (acc, chainId) => ({
      ...acc,
      [chainId]: typeof value === 'function' ? (value as (chainId: SupportedChainId) => T)(chainId) : value,
    }),
    {},
  )
}

export function mapAllNetworks<T>(value: (chainId: TargetChainId) => T): Record<TargetChainId, T>
export function mapAllNetworks<T>(value: T): Record<TargetChainId, T>
export function mapAllNetworks<T>(value: T | ((chainId: TargetChainId) => T)): Record<TargetChainId, T> {
  return ALL_CHAINS_IDS.reduce<Record<number, T>>(
    (acc, chainId) => ({
      ...acc,
      [chainId]: typeof value === 'function' ? (value as (chainId: TargetChainId) => T)(chainId) : value,
    }),
    {},
  )
}

export function mapAddressToSupportedNetworks(address: string): Record<SupportedChainId, string> {
  return mapSupportedNetworks(address)
}
